<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM clients");
$clients = $stmt->fetchAll();

foreach ($clients as &$client) {
    $stmtProj = $pdo->prepare("SELECT * FROM projects WHERE client_id = ?");
    $stmtProj->execute([$client['id']]);
    $projects = $stmtProj->fetchAll();

    foreach ($projects as &$project) {
        $stmtMod = $pdo->prepare("SELECT model_id FROM project_models WHERE project_id = ?");
        $stmtMod->execute([$project['id']]);
        $project['models'] = $stmtMod->fetchAll(PDO::FETCH_COLUMN);
        $project['budget'] = (float)$project['budget'];
    }
    $client['projects'] = $projects;
}

echo json_encode($clients);
?>
