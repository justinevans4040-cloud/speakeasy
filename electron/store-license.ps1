$ErrorActionPreference = 'Stop'

function ConvertTo-DemoResult([string]$Reason) {
    [ordered]@{
        access      = 'demo'
        entitlement = $null
        products    = [ordered]@{}
        reason      = $Reason
    }
}

function Wait-WindowsRuntimeOperation($Operation, [Type]$ResultType) {
    $asTaskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() |
        Where-Object {
            $_.Name -eq 'AsTask' -and
            $_.IsGenericMethod -and
            $_.GetParameters().Count -eq 1
        } |
        Select-Object -First 1

    if (-not $asTaskMethod) {
        throw 'Windows Runtime task support is unavailable.'
    }

    $task = $asTaskMethod.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
    $task.GetAwaiter().GetResult()
}

try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    [void][Windows.Services.Store.StoreContext, Windows.Services.Store, ContentType = WindowsRuntime]
    [void][Windows.Services.Store.StoreProductQueryResult, Windows.Services.Store, ContentType = WindowsRuntime]
    [void][Windows.Services.Store.StoreAppLicense, Windows.Services.Store, ContentType = WindowsRuntime]

    $context = [Windows.Services.Store.StoreContext]::GetDefault()
    if (-not $context) {
        throw 'Microsoft Store context is unavailable. Install and launch SpeakEasy from Microsoft Store.'
    }

    $kinds = [string[]]@('Durable', 'Subscription')
    $query = Wait-WindowsRuntimeOperation ($context.GetAssociatedStoreProductsAsync($kinds)) ([Windows.Services.Store.StoreProductQueryResult])
    $license = Wait-WindowsRuntimeOperation ($context.GetAppLicenseAsync()) ([Windows.Services.Store.StoreAppLicense])

    $activeStoreIds = @{}
    foreach ($entry in $license.AddOnLicenses.GetEnumerator()) {
        if ($entry.Value.IsActive) {
            $activeStoreIds[$entry.Key] = $true
        }
    }

    $products = [ordered]@{}
    foreach ($entry in $query.Products.GetEnumerator()) {
        $product = $entry.Value
        $name = switch ($product.InAppOfferToken) {
            'speakeasy_monthly' { 'monthly' }
            'speakeasy_lifetime' { 'lifetime' }
            default { $null }
        }
        if (-not $name) { continue }

        $owned = [bool]($product.IsInUserCollection -or $activeStoreIds.ContainsKey($product.StoreId))
        $products[$name] = [ordered]@{
            storeId        = $product.StoreId
            offerToken     = $product.InAppOfferToken
            title          = $product.Title
            formattedPrice = $product.Price.FormattedPrice
            owned          = $owned
        }
    }

    $entitlement = $null
    if ($products.Contains('lifetime') -and $products.lifetime.owned) {
        $entitlement = 'lifetime'
    } elseif ($products.Contains('monthly') -and $products.monthly.owned) {
        $entitlement = 'monthly'
    }

    [ordered]@{
        access      = if ($entitlement) { 'full' } else { 'demo' }
        entitlement = $entitlement
        products    = $products
        reason      = if ($entitlement) { $null } else { 'No active SpeakEasy purchase was found for this Microsoft account.' }
    } | ConvertTo-Json -Compress -Depth 6
} catch {
    ConvertTo-DemoResult $_.Exception.Message | ConvertTo-Json -Compress -Depth 6
}
