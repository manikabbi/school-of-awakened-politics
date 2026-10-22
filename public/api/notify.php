<?php
/**
 * School of Awakened Politics (SAP)
 * Native Server Notification Mailer
 * 
 * Securely delivers real-time notifications for:
 * - Fellowship Applications
 * - Article Proposals & Manuscripts
 * - Contact Inquiries
 * - Gazette Newsletter Subscriptions
 * - Civic Leader Diagnostic Completions
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// Parse incoming payload
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No data received']);
    exit;
}

$recipient = 'info@schoolofawakenedpolitics.org';
$formType  = isset($data['formType']) ? trim($data['formType']) : 'general';
$refId     = isset($data['id']) ? trim($data['id']) : (isset($data['refId']) ? trim($data['refId']) : ('SAP-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8))));
$fullName  = isset($data['fullName']) ? trim($data['fullName']) : (isset($data['authorName']) ? trim($data['authorName']) : (isset($data['name']) ? trim($data['name']) : ''));
$email     = isset($data['email']) ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : '';
$phone     = isset($data['phone']) ? trim($data['phone']) : '';
$program   = isset($data['program']) ? trim($data['program']) : '';
$archetype = isset($data['archetype']) ? trim($data['archetype']) : '';
$statement = isset($data['statement']) ? trim($data['statement']) : (isset($data['message']) ? trim($data['message']) : '');

// Article Proposal specific fields
$title       = isset($data['title']) ? trim($data['title']) : (isset($data['articleTitle']) ? trim($data['articleTitle']) : '');
$category    = isset($data['category']) ? trim($data['category']) : (isset($data['track']) ? trim($data['track']) : '');
$affiliation = isset($data['affiliation']) ? trim($data['affiliation']) : (isset($data['role']) ? trim($data['role']) : '');
$abstract    = isset($data['abstract']) ? trim($data['abstract']) : $statement;
$draftUrl    = isset($data['draftUrl']) ? trim($data['draftUrl']) : (isset($data['manuscriptUrl']) ? trim($data['manuscriptUrl']) : '');

$timestamp = date('d M Y, h:i A') . ' IST';

// Determine Subject & Preheader based on Form Type
switch ($formType) {
    case 'article':
    case 'manuscript':
    case 'proposal':
        $subject = "New Article Proposal [{$refId}]: " . ($title ?: 'Manuscript') . ($fullName ? " by {$fullName}" : "");
        $badge = "ARTICLE / MANUSCRIPT PROPOSAL";
        $badgeColor = "#C05621";
        break;

    case 'contact':
        $subject = "New SAP Contact Inquiry [{$refId}]: " . ($fullName ?: 'Visitor');
        $badge = "CONTACT INQUIRY";
        $badgeColor = "#2563EB";
        break;

    case 'newsletter':
        $subject = "New SAP Gazette Subscriber: {$email}";
        $badge = "GAZETTE SUBSCRIBER";
        $badgeColor = "#059669";
        break;

    case 'quiz':
        $subject = "Civic Diagnostic Quiz Completion: " . ($fullName ?: ($email ?: 'Anonymous')) . " ({$archetype})";
        $badge = "CIVIC LEADER DIAGNOSTIC";
        $badgeColor = "#7C3AED";
        break;

    case 'application':
    default:
        $subject = "New SAP Fellowship Application [{$refId}]: " . ($fullName ?: 'Applicant') . ($archetype ? " ({$archetype})" : "");
        $badge = "FELLOWSHIP APPLICATION";
        $badgeColor = "#0B192C";
        break;
}

// Build Clean HTML Email Body
$html = '<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
  .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
  .header { background: #0B192C; color: #ffffff; padding: 24px 28px; }
  .logo-title { font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; margin: 0; }
  .logo-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24; margin-top: 4px; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #ffffff; background-color: ' . $badgeColor . '; margin-top: 12px; }
  .content { padding: 28px; }
  .ref-box { background: #f1f5f9; border-left: 4px solid #C05621; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; font-size: 13px; }
  .field-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .field-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; }
  .field-label { width: 34%; font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  .field-value { width: 66%; color: #0f172a; font-weight: 500; }
  .statement-box { background: #fdfcfb; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-top: 12px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
  .footer { background: #f8fafc; padding: 16px 28px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-title">School of Awakened Politics</div>
      <div class="logo-sub">Lead from Your Authentic Self</div>
      <div class="badge">' . htmlspecialchars($badge) . '</div>
    </div>
    <div class="content">
      <div class="ref-box">
        <strong>Reference ID:</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold; color: #C05621;">' . htmlspecialchars($refId) . '</span><br>
        <strong>Logged At:</strong> ' . htmlspecialchars($timestamp) . '
      </div>

      <table class="field-table">';

if ($fullName) {
    $html .= '<tr><td class="field-label">Full Name</td><td class="field-value">' . htmlspecialchars($fullName) . '</td></tr>';
}
if ($email) {
    $html .= '<tr><td class="field-label">Email Address</td><td class="field-value"><a href="mailto:' . htmlspecialchars($email) . '" style="color: #2563eb; text-decoration: none;">' . htmlspecialchars($email) . '</a></td></tr>';
}
if ($phone) {
    $html .= '<tr><td class="field-label">Phone / WhatsApp</td><td class="field-value"><a href="tel:' . htmlspecialchars($phone) . '" style="color: #2563eb; text-decoration: none;">' . htmlspecialchars($phone) . '</a></td></tr>';
}
if ($affiliation) {
    $html .= '<tr><td class="field-label">Affiliation / Role</td><td class="field-value">' . htmlspecialchars($affiliation) . '</td></tr>';
}
if ($title) {
    $html .= '<tr><td class="field-label">Article Title</td><td class="field-value"><strong>' . htmlspecialchars($title) . '</strong></td></tr>';
}
if ($category) {
    $html .= '<tr><td class="field-label">Thematic Area</td><td class="field-value">' . htmlspecialchars($category) . '</td></tr>';
}
if ($program) {
    $html .= '<tr><td class="field-label">Program / Area</td><td class="field-value">' . htmlspecialchars($program) . '</td></tr>';
}
if ($archetype) {
    $html .= '<tr><td class="field-label">Civic Archetype</td><td class="field-value"><strong style="color: #C05621;">' . htmlspecialchars($archetype) . '</strong></td></tr>';
}
if ($draftUrl) {
    $html .= '<tr><td class="field-label">Draft / Manuscript</td><td class="field-value"><a href="' . htmlspecialchars($draftUrl) . '" target="_blank" style="color: #2563eb; text-decoration: underline;">Open Submitted Draft ↗</a></td></tr>';
}

$html .= '</table>';

if ($abstract) {
    $label = ($formType === 'article' || $formType === 'manuscript' || $formType === 'proposal') ? 'Abstract / Proposal Synopsis' : 'Motivation Statement / Inquiry';
    $html .= '<div style="margin-top: 16px;">
      <span class="field-label">' . htmlspecialchars($label) . '</span>
      <div class="statement-box">' . nl2br(htmlspecialchars($abstract)) . '</div>
    </div>';
}

$html .= '
    </div>
    <div class="footer">
      Automated dispatch from <a href="https://schoolofawakenedpolitics.org" style="color: #64748b;">schoolofawakenedpolitics.org</a> · Also synced to SAP Google Sheets CRM.
    </div>
  </div>
</body>
</html>';

// Mail headers
$senderDomain = 'schoolofawakenedpolitics.org';
$fromEmail = 'notifications@' . $senderDomain;
$replyTo = $email ?: $recipient;

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: SAP Portal <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$replyTo}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-SAP-RefID: {$refId}\r\n";

$sent = @mail($recipient, $subject, $html, $headers);

echo json_encode([
    'status'   => $sent ? 'success' : 'warning',
    'message'  => $sent ? 'Notification email dispatched to admissions' : 'Mail transport queued',
    'refId'    => $refId,
    'time'     => $timestamp
]);
