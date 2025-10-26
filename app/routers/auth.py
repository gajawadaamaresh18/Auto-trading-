from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import boto3
import uuid
from app.database import get_db
from app.models import User
from app.schemas import (
    UserCreate, UserLogin, UserResponse, Token, KYCUpload, KYCResponse,
    KYCDocument, KYCStatus
)
from app.auth import get_password_hash, verify_password, create_access_token, get_current_active_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])

# Initialize S3 client for KYC document uploads
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region
)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user with email and username validation.
    Returns user information without sensitive data.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT access token.
    
    Validates email and password, returns access token for authenticated requests.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(current_user: User = Depends(get_current_active_user)):
    """
    Logout current user.
    
    In a stateless JWT implementation, logout is handled client-side by removing the token.
    This endpoint can be used for logging purposes or future token blacklisting.
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current user information.
    
    Returns the authenticated user's profile information.
    """
    return current_user


@router.post("/kyc/upload", response_model=KYCResponse)
async def upload_kyc_documents(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload KYC documents for identity verification.
    
    Accepts multiple document files and uploads them to secure storage.
    Updates user's KYC status to pending review.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
    
    uploaded_documents = []
    
    for file in files:
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"kyc/{current_user.id}/{uuid.uuid4()}.{file_extension}"
        
        # Upload to S3
        try:
            file_content = await file.read()
            s3_client.put_object(
                Bucket=settings.s3_bucket,
                Key=unique_filename,
                Body=file_content,
                ContentType=file.content_type
            )
            
            # Generate presigned URL for access
            file_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.s3_bucket, 'Key': unique_filename},
                ExpiresIn=3600  # 1 hour
            )
            
            uploaded_documents.append(KYCDocument(
                document_type=file.filename.split('.')[0],
                file_url=file_url,
                uploaded_at=datetime.utcnow()
            ))
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload {file.filename}: {str(e)}"
            )
    
    # Update user's KYC status and documents
    current_user.kyc_status = KYCStatus.PENDING
    current_user.kyc_documents = [doc.dict() for doc in uploaded_documents]
    
    db.commit()
    
    return KYCResponse(
        status=current_user.kyc_status,
        documents=uploaded_documents,
        message="KYC documents uploaded successfully. Pending review."
    )


@router.get("/kyc/status", response_model=KYCResponse)
async def get_kyc_status(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current KYC verification status.
    
    Returns the user's KYC status and uploaded documents.
    """
    documents = []
    if current_user.kyc_documents:
        documents = [
            KYCDocument(**doc) for doc in current_user.kyc_documents
        ]
    
    return KYCResponse(
        status=current_user.kyc_status,
        documents=documents,
        message=f"KYC status: {current_user.kyc_status}"
    )