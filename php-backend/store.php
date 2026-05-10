<?php
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$key = $_GET['key'] ?? '';
if (!$key) {
    echo json_encode(['error' => 'Missing key']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Only delete from generic store. Structured tables require specialized endpoints or logic if needed, 
        // but typically generic key delete means from KV.
        $stmt = $pdo->prepare("DELETE FROM key_value_store WHERE store_key = ?");
        $stmt->execute([$key]);
        echo json_encode(['success' => true]);
        exit;
    }

    $rawBody = file_get_contents("php://input");
    $data = json_decode($rawBody, true);

    // Depending on the key, route arrays of data into structured tables
    switch ($key) {
        case 'studio_employees':
            if (is_array($data)) {
                $pdo->exec("TRUNCATE TABLE employees"); // Sync completely
                $stmt = $pdo->prepare("INSERT INTO employees (id, name, email, phone, role, salary, joiningDate, status, password, permissions, isSuperAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data as $emp) {
                    $stmt->execute([
                        $emp['id'] ?? uniqid(),
                        $emp['name'] ?? '',
                        $emp['email'] ?? '',
                        $emp['phone'] ?? '',
                        $emp['role'] ?? '',
                        $emp['salary'] ?? '',
                        $emp['joiningDate'] ?? '',
                        $emp['status'] ?? 'Active',
                        $emp['password'] ?? '',
                        isset($emp['permissions']) ? json_encode($emp['permissions']) : '[]',
                        ($emp['isSuperAdmin'] ?? false) ? 1 : 0
                    ]);
                }
            }
            break;

        case 'studio_leads':
            if (is_array($data)) {
                $pdo->exec("TRUNCATE TABLE leads");
                $stmt = $pdo->prepare("INSERT INTO leads (id, name, company, phone, email, status, notes, followUpDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data as $lead) {
                    $stmt->execute([
                        $lead['id'] ?? uniqid(),
                        $lead['name'] ?? '',
                        $lead['company'] ?? '',
                        $lead['phone'] ?? '',
                        $lead['email'] ?? '',
                        $lead['status'] ?? 'New',
                        $lead['notes'] ?? '',
                        $lead['followUpDate'] ?? ''
                    ]);
                }
            }
            break;

        case 'studio_task_manager':
            if (is_array($data)) {
                $pdo->exec("TRUNCATE TABLE tasks");
                $stmt = $pdo->prepare("INSERT INTO tasks (id, title, description, status, assignedTo, dueDate) VALUES (?, ?, ?, ?, ?, ?)");
                foreach ($data as $task) {
                    $stmt->execute([
                        $task['id'] ?? uniqid(),
                        $task['title'] ?? '',
                        $task['description'] ?? '',
                        $task['status'] ?? 'To Do',
                        $task['assignedTo'] ?? '',
                        $task['dueDate'] ?? ''
                    ]);
                }
            }
            break;

        case 'workLogs':
            if (is_array($data)) {
                $pdo->exec("TRUNCATE TABLE work_logs");
                $stmt = $pdo->prepare("INSERT INTO work_logs (id, userId, date, task, hours) VALUES (?, ?, ?, ?, ?)");
                foreach ($data as $log) {
                    $stmt->execute([
                        $log['id'] ?? uniqid(),
                        $log['userId'] ?? '',
                        $log['date'] ?? '',
                        $log['task'] ?? '',
                        $log['hours'] ?? 0
                    ]);
                }
            }
            break;

        case 'timeLogs':
            if (is_array($data)) {
                $pdo->exec("TRUNCATE TABLE time_logs");
                $stmt = $pdo->prepare("INSERT INTO time_logs (id, userId, date, checkIn, checkOut, totalHours, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
                foreach ($data as $log) {
                    $stmt->execute([
                        $log['id'] ?? uniqid(),
                        $log['userId'] ?? '',
                        $log['date'] ?? '',
                        $log['checkIn'] ?? '',
                        $log['checkOut'] ?? '',
                        $log['totalHours'] ?? 0,
                        $log['notes'] ?? ''
                    ]);
                }
            }
            break;

        case 'studio_message_templates':
            if (is_array($data)) {
                $pdo->exec("TRUNCATE TABLE message_templates");
                $stmt = $pdo->prepare("INSERT INTO message_templates (id, title, content) VALUES (?, ?, ?)");
                foreach ($data as $tpl) {
                    $stmt->execute([
                        $tpl['id'] ?? uniqid(),
                        $tpl['title'] ?? '',
                        $tpl['content'] ?? ''
                    ]);
                }
            }
            break;

        default:
            // For all other entities (like settings, comments, config), use Generic KV Store
            $valueStr = is_string($data) ? $data : (is_array($data) ? json_encode($data) : $rawBody);
            $stmt = $pdo->prepare("INSERT INTO key_value_store (store_key, store_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE store_value = ?");
            $stmt->execute([$key, $valueStr, $valueStr]);
            break;
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
