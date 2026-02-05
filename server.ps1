# Simple static file server on http://localhost:8080
$port = 8080
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop."
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $root ($path -replace "^/", "" -replace "/", [IO.Path]::DirectorySeparatorChar)
    if (Test-Path $filePath -PathType Leaf) {
        $content = [IO.File]::ReadAllBytes($filePath)
        $ext = [IO.Path]::GetExtension($filePath).ToLower()
        $contentType = @{
            ".html" = "text/html"
            ".css"  = "text/css"
            ".js"   = "application/javascript"
            ".json" = "application/json"
            ".ico"  = "image/x-icon"
            ".png"  = "image/png"
            ".jpg"  = "image/jpeg"
            ".svg"  = "image/svg+xml"
        }[$ext]
        if (-not $contentType) { $contentType = "application/octet-stream" }
        $response.ContentType = $contentType
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    }
    elseif (Test-Path $filePath -PathType Container) {
        $indexPath = Join-Path $filePath "index.html"
        if (Test-Path $indexPath) {
            $path = $path.TrimEnd("/") + "/index.html"
            $filePath = $indexPath
            $content = [IO.File]::ReadAllBytes($filePath)
            $response.ContentType = "text/html"
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
    }
    else {
        $response.StatusCode = 404
        $buffer = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    $response.Close()
}
