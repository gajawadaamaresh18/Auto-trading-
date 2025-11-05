# PowerShell script to check GitHub Actions workflow status
# This script fetches the latest workflow run status

$repo = "gajawadaamaresh18/Auto-trading-"
$url = "https://api.github.com/repos/$repo/actions/runs?per_page=1"

Write-Host "Fetching latest workflow run status for $repo..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers @{
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "Auto-Trading-CI-Check"
    }
    
    if ($response.workflow_runs.Count -gt 0) {
        $run = $response.workflow_runs[0]
        
        Write-Host "`n=== Latest Workflow Run ===" -ForegroundColor Yellow
        Write-Host "Run ID: $($run.id)" -ForegroundColor White
        Write-Host "Status: $($run.status)" -ForegroundColor $(if ($run.status -eq "completed") { "Green" } else { "Yellow" })
        Write-Host "Conclusion: $($run.conclusion)" -ForegroundColor $(if ($run.conclusion -eq "success") { "Green" } elseif ($run.conclusion -eq "failure") { "Red" } else { "Yellow" })
        Write-Host "Workflow: $($run.name)" -ForegroundColor White
        Write-Host "Branch: $($run.head_branch)" -ForegroundColor White
        Write-Host "Commit: $($run.head_sha.Substring(0,7))" -ForegroundColor White
        Write-Host "Created: $($run.created_at)" -ForegroundColor White
        Write-Host "URL: $($run.html_url)" -ForegroundColor Cyan
        
        if ($run.conclusion -eq "failure") {
            Write-Host "`n⚠️  Workflow failed! Check the logs at: $($run.html_url)" -ForegroundColor Red
        } elseif ($run.conclusion -eq "success") {
            Write-Host "`n✅ Workflow succeeded!" -ForegroundColor Green
        }
    } else {
        Write-Host "No workflow runs found." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error fetching workflow status: $_" -ForegroundColor Red
    Write-Host "`nYou can manually check the workflow at:" -ForegroundColor Yellow
    Write-Host "https://github.com/$repo/actions" -ForegroundColor Cyan
}

