<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>GESTAD - Sistema de Gestão Acadêmica</title>
    <meta name="description" content="Sistema web de gestão acadêmica para programas de pós-graduação">
    <meta name="author" content="GESTAD">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Meta Tags -->
    <meta property="og:title" content="GESTAD - Sistema de Gestão Acadêmica">
    <meta property="og:description" content="Sistema web de gestão acadêmica para programas de pós-graduação">
    <meta property="og:type" content="website">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="GESTAD - Sistema de Gestão Acadêmica">

    @viteReactRefresh
    @vite(['front-end/src/main.tsx'])
</head>
<body>
    <!-- React Application mounts here -->
    <div id="root"></div>

    <!-- Laravel Config for SPA -->
    <script>
        window.Laravel = {
            csrfToken: '{{ csrf_token() }}',
            baseUrl: '{{ url('/') }}'
        };
    </script>
</body>
</html>