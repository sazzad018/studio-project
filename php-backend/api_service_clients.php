<?php
require_once 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Fetch all service clients
        $stmt = $pdo->query("SELECT * FROM service_clients");
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse JSON details back into the array
        foreach ($clients as &$client) {
            if (!empty($client['details'])) {
                $details = json_decode($client['details'], true);
                if (is_array($details)) {
                    foreach ($details as $key => $value) {
                        $client[$key] = $value;
                    }
                }
            }
            unset($client['details']);
            $client['isPinned'] = (bool)$client['isPinned'];
        }

        // Fetch comments
        $stmt = $pdo->query("SELECT * FROM service_comments ORDER BY createdAt DESC");
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch reminders
        $stmt = $pdo->query("SELECT * FROM service_reminders");
        $reminders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($reminders as &$reminder) {
            $reminder['isFbAdEndReminder'] = (bool)$reminder['isFbAdEndReminder'];
        }

        echo json_encode([
            'clients' => $clients,
            'comments' => $comments,
            'reminders' => $reminders
        ]);
        exit;
    }

    if ($method === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON payload']);
            exit;
        }

        $action = isset($_GET['action']) ? $_GET['action'] : 'save_client';

        if ($action === 'save_client') {
            // Save or Update Client
            $id = $data['id'] ?? uniqid();
            $businessName = $data['businessName'] ?? '';
            $websiteUrl = $data['websiteUrl'] ?? '';
            $whatsappNumber = $data['whatsappNumber'] ?? '';
            $email = $data['email'] ?? '';
            $serviceType = $data['serviceType'] ?? 'Marketing';
            $status = $data['status'] ?? 'Active';
            $facebookPageLink = $data['facebookPageLink'] ?? '';
            $adAccountId = $data['adAccountId'] ?? '';
            $createdAt = $data['createdAt'] ?? date('c');
            $isPinned = !empty($data['isPinned']) ? 1 : 0;

            // Extract all other fields into 'details' JSON
            $coreFields = ['id', 'businessName', 'websiteUrl', 'whatsappNumber', 'email', 'serviceType', 'status', 'facebookPageLink', 'adAccountId', 'createdAt', 'isPinned'];
            $details = [];
            foreach ($data as $key => $value) {
                if (!in_array($key, $coreFields)) {
                    $details[$key] = $value;
                }
            }
            $detailsJson = json_encode($details);

            $stmt = $pdo->prepare("
                INSERT INTO service_clients (id, businessName, websiteUrl, whatsappNumber, email, serviceType, status, facebookPageLink, adAccountId, createdAt, isPinned, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                businessName=VALUES(businessName), websiteUrl=VALUES(websiteUrl), whatsappNumber=VALUES(whatsappNumber), email=VALUES(email), 
                serviceType=VALUES(serviceType), status=VALUES(status), facebookPageLink=VALUES(facebookPageLink), adAccountId=VALUES(adAccountId), 
                isPinned=VALUES(isPinned), details=VALUES(details)
            ");
            $stmt->execute([$id, $businessName, $websiteUrl, $whatsappNumber, $email, $serviceType, $status, $facebookPageLink, $adAccountId, $createdAt, $isPinned, $detailsJson]);

            echo json_encode(['success' => true, 'id' => $id]);
            exit;
        }

        if ($action === 'add_comment') {
            $id = $data['id'] ?? uniqid();
            $clientId = $data['clientId'];
            $text = $data['text'];
            $authorId = $data['authorId'] ?? '';
            $authorName = $data['authorName'] ?? '';
            $createdAt = $data['createdAt'] ?? date('c');

            $stmt = $pdo->prepare("INSERT INTO service_comments (id, clientId, text, authorId, authorName, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $clientId, $text, $authorId, $authorName, $createdAt]);
            echo json_encode(['success' => true, 'id' => $id]);
            exit;
        }

        if ($action === 'add_reminder') {
            $id = $data['id'] ?? uniqid();
            $clientId = $data['clientId'];
            $text = $data['text'];
            $assignedToId = $data['assignedToId'] ?? '';
            $dueDate = $data['dueDate'] ?? '';
            $isFbAdEndReminder = !empty($data['isFbAdEndReminder']) ? 1 : 0;

            $stmt = $pdo->prepare("INSERT INTO service_reminders (id, clientId, text, assignedToId, dueDate, isFbAdEndReminder) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $clientId, $text, $assignedToId, $dueDate, $isFbAdEndReminder]);
            echo json_encode(['success' => true, 'id' => $id]);
            exit;
        }
        
        if ($action === 'delete_reminder') {
            $id = $data['id'];
            $stmt = $pdo->prepare("DELETE FROM service_reminders WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            exit;
        }
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM service_clients WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID']);
        }
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
