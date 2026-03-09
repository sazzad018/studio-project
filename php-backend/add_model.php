<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 'm' . time() . rand(100, 999);
    $stmt = $pdo->prepare("INSERT INTO models (id, name, category, hourlyRate, rating, imageUrl, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $data->name, $data->category, $data->hourlyRate, $data->rating, $data->imageUrl, $data->status]);
    
    $data->id = $id;
    $data->projects = [];
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
