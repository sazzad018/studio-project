<?php
require 'db.php';
$data = json_decode(file_get_contents("php://input"));

if($data) {
    $id = 's' . time() . rand(100, 999);
    $participants = json_encode($data->participants);
    
    $stmt = $pdo->prepare("INSERT INTO schedule (id, title, date, type, participants, status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id, $data->title, $data->date, $data->type, $participants, $data->status]);
    
    $data->id = $id;
    echo json_encode($data);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
}
?>
