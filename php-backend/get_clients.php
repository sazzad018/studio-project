<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM clients");
$clients = $stmt->fetchAll();

foreach ($clients as &$client) {
    $stmtProj = $pdo->prepare("SELECT * FROM projects WHERE client_id = ?");
    $stmtProj->execute([$client['id']]);
    $projects = $stmtProj->fetchAll();

    $totalBudget = 0;
    foreach ($projects as &$project) {
        $stmtMod = $pdo->prepare("SELECT model_id FROM project_models WHERE project_id = ?");
        $stmtMod->execute([$project['id']]);
        $project['models'] = $stmtMod->fetchAll(PDO::FETCH_COLUMN);
        $project['budget'] = (float)$project['budget'];
        $totalBudget += $project['budget'];
    }
    $client['projects'] = $projects;
    
    // Ensure totalBudget exists (either from DB if added, or calculated from projects)
    if (!isset($client['totalBudget'])) {
        $client['totalBudget'] = $totalBudget;
    } else {
        $client['totalBudget'] = (float)$client['totalBudget'];
    }
}

echo json_encode($clients);
?>
