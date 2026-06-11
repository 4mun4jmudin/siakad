<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = app()->make('App\Http\Controllers\Admin\MataPelajaranController');
    $request = Illuminate\Http\Request::create('/mata-pelajaran/auto-assign-guru', 'POST');
    $response = $controller->autoAssignGuru($request);
    
    // Check if it's a redirect response
    if ($response instanceof \Illuminate\Http\RedirectResponse) {
        $session = session()->all();
        echo "Redirect Response.\n";
        if (isset($session['success'])) {
            echo "SUCCESS: " . $session['success'] . "\n";
        }
        if (isset($session['error'])) {
            echo "ERROR: " . $session['error'] . "\n";
        }
    } else {
        echo "Other Response:\n";
        print_r($response);
    }
} catch (\Exception $e) {
    echo "EXCEPTION:\n";
    echo $e->getMessage() . "\n";
}
