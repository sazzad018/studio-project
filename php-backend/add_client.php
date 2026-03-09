<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 'c' . time() . rand(100, 999);
    $stmt = $pdo->prepare("INSERT INTO clients (id, name, company, email, phone, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $data->name, $data->company, $data->email, $data->phone, $data->status]);
    
    $data->id = $id;
    $data->projects = [];
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
