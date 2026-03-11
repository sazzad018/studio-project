<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data && isset($data->projectId)) {
    $projectId = $data->projectId;
    
    if (isset($data->newClientId) && $data->newClientId !== $data->clientId) {
        $stmt = $pdo->prepare("UPDATE projects SET client_id = ? WHERE id = ?");
        $stmt->execute([$data->newClientId, $projectId]);
    }

    $fields = [];
    $values = [];
    if (isset($data->name)) { 
        $fields[] = "name = ?"; 
        $values[] = $data->name; 
    } elseif (isset($data->title)) { 
        $fields[] = "name = ?"; 
        $values[] = $data->title; 
    }
    if (isset($data->status)) { $fields[] = "status = ?"; $values[] = $data->status; }
    if (isset($data->dueDate)) { $fields[] = "dueDate = ?"; $values[] = $data->dueDate; }
    if (isset($data->budget)) { $fields[] = "budget = ?"; $values[] = $data->budget; }
    
    if (count($fields) > 0) {
        $values[] = $projectId;
        $sql = "UPDATE projects SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
    }

    if (isset($data->models) && is_array($data->models)) {
        $pdo->prepare("DELETE FROM project_models WHERE project_id = ?")->execute([$projectId]);
        $stmtMod = $pdo->prepare("INSERT INTO project_models (project_id, model_id) VALUES (?, ?)");
        foreach ($data->models as $modelId) {
            $stmtMod->execute([$projectId, $modelId]);
        }
    }
    
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
