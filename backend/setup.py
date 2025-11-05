"""Setup configuration for Auto Trading Backend."""

from setuptools import setup, find_packages

setup(
    name="auto-trading-backend",
    version="1.0.0",
    description="Auto Trading Backend API",
    packages=find_packages(),
    python_requires=">=3.11",
    install_requires=[
        # Dependencies will be installed from requirements.txt
    ],
)

