<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->clientId)) {
    $id = 'p' . time() . rand(100, 999);
    
    // Handle frontend sending 'title' instead of 'name'
    $name = isset($data->title) ? $data->title : (isset($data->name) ? $data->name : '');
    $status = isset($data->status) ? $data->status : 'Planning';
    $dueDate = isset($data->dueDate) ? $data->dueDate : '';
    $budget = isset($data->budget) ? $data->budget : 0;
    
    $stmt = $pdo->prepare("INSERT INTO projects (id, client_id, name, status, dueDate, budget) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $data->clientId, $name, $status, $dueDate, $budget]);
    
    if (isset($data->models) && is_array($data->models)) {
        $stmtMod = $pdo->prepare("INSERT INTO project_models (project_id, model_id) VALUES (?, ?)");
        foreach ($data->models as $modelId) {
            $stmtMod->execute([$id, $modelId]);
        }
    }
    
    $data->id = $id;
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
