<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $data = [];

    // 1. Fetch Key-Value pair general states (settings, metadata)
    $stmt = $pdo->query("SELECT store_key, store_value FROM key_value_store");
    while ($row = $stmt->fetch()) {
        $value = json_decode($row['store_value'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $data[$row['store_key']] = $value;
        } else {
            $data[$row['store_key']] = $row['store_value'];
        }
    }

    // 2. We could optionally override or populate core entities from relational tables
    // If the frontend relies heavily on specific keys like `studio_employees`,
    // we fetch them from their respective relational tables to ensure consistency.

    /* Example of structuring core entities back into JSON blob for sync: */
    
    // Employees
    $stmt = $pdo->query("SELECT * FROM employees");
    $data['studio_employees'] = $stmt->fetchAll();
    foreach ($data['studio_employees'] as &$emp) {
        if (!empty($emp['permissions'])) $emp['permissions'] = json_decode($emp['permissions']);
    }

    // Leads
    $stmt = $pdo->query("SELECT * FROM leads");
    $data['studio_leads'] = $stmt->fetchAll();

    // Tasks
    $stmt = $pdo->query("SELECT * FROM tasks");
    $data['studio_task_manager'] = $stmt->fetchAll();

    // Invoices
    $stmt = $pdo->query("SELECT * FROM invoices");
    $data['studio_invoices'] = $stmt->fetchAll();
    foreach ($data['studio_invoices'] as &$inv) {
        if (!empty($inv['items'])) $inv['items'] = json_decode($inv['items']);
    }

    // Work logs
    $stmt = $pdo->query("SELECT * FROM work_logs");
    $data['workLogs'] = $stmt->fetchAll();

    // Time logs
    $stmt = $pdo->query("SELECT * FROM time_logs");
    $data['timeLogs'] = $stmt->fetchAll();

    // Message Templates
    $stmt = $pdo->query("SELECT * FROM message_templates");
    $data['studio_message_templates'] = $stmt->fetchAll();

    // Output all merged data ensuring the front-end receives everything perfectly
    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
