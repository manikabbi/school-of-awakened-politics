#!/usr/bin/env bash
set -e

echo "🚀 Building latest production assets..."
npm run build

echo "📡 Deploying to Hostinger via SSH..."
/usr/bin/expect -c '
set timeout 120
spawn rsync -avz --delete -e "ssh -p 65002 -o StrictHostKeyChecking=no" dist/ u537812174@82.180.143.68:domains/schoolofawakenedpolitics.org/public_html/
expect {
    "password:" {
        send "Mahadevmanik@123!\r"
        exp_continue
    }
    eof
}
'

echo "✅ Deployment complete! Live at https://schoolofawakenedpolitics.org/"
