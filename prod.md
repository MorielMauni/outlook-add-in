# Production Deployment & Configuration Guide

This guide covers setting up the "M&D Signatures" add-in for production using **Cloudflare Tunnel** for secure external access and **Microsoft Graph** for Lawyer verification.

## 1. "Lawyer" Signature Logic (Exchange Group)

To support the requirement of adding "Lawyer" (English) or "עו\"ד" (Hebrew) based on membership in an Exchange Online group, we use the code below.

### Step 1.1: HTML Templates

Ensure your templates (`assets/signature-english.html`, `assets/signature-hebrew.html`) use these placeholders:

- `{NAME}`
- `{ROLE}`
- `{PHONE}`
- `{FAX}`
- `{EMAIL}`

### Step 1.2: Update `src/runtime/autorunshared.js`

Replace the content of `src/runtime/autorunshared.js` with the following.
**Key Change**: We now map `jobTitle`, `mobilePhone`, etc., to your new placeholders.

```javascript
/* global Office */

// === CONFIGURATION ===
// The Object ID of the "Lawyers" group in Azure AD / Exchange Online
const LAWYER_GROUP_ID = "YOUR_GROUP_OBJECT_ID_HERE";

// Entry point for events
function checkSignature(event) {
  setSignature("hebrew", event);
}

async function setSignature(type, event) {
  // 1. Get User Profile Data
  const userProfile = Office.context.mailbox.userProfile;
  let displayName = userProfile.displayName;
  const email = userProfile.emailAddress;

  // Note: To get Job Title, Phone, etc., we generally need to make a Graph Call
  // because standard `userProfile` only has basic info.
  // However, for this snippet, we will assume we fetch them or use fallbacks.
  let jobTitle = "IT"; // Default or fetch from Graph
  let phone = "050-0000000";
  let fax = "03-0000000";

  try {
    // 2. Check Group Membership & Fetch Details
    // We assume checkUserIsLawyer returns an object with details if possible,
    // or we make a separate call.
    const lawyerInfo = await checkUserIsLawyer();
    const isLawyer = lawyerInfo.isMember;

    // If your backend returns these details, use them:
    if (lawyerInfo.jobTitle) jobTitle = lawyerInfo.jobTitle;
    if (lawyerInfo.mobilePhone) phone = lawyerInfo.mobilePhone;

    // 3. Modify Name/Role based on role and language
    if (isLawyer) {
      if (type === "hebrew") {
        displayName = `עו"ד ${displayName}`;
        // jobTitle = "עורך דין"; // Optional: Override title
      } else {
        displayName = `${displayName}, Lawyer`;
        // jobTitle = "Lawyer"; // Optional: Override title
      }
    }

    // 4. Fetch the template
    // PRODUCTION URL: User Cloudflare domain
    const baseUrl = "https://signatures.your-domain.com/assets/";
    const fileName =
      type === "hebrew" ? "signature-hebrew.html" : "signature-english.html";
    const url = baseUrl + fileName;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load signature file: ${response.statusText}`);
    }
    let signatureHtml = await response.text();

    // 5. Replace Placeholders
    signatureHtml = signatureHtml.replace(/{NAME}/g, escapeHtml(displayName));
    signatureHtml = signatureHtml.replace(/{ROLE}/g, escapeHtml(jobTitle));
    signatureHtml = signatureHtml.replace(/{PHONE}/g, escapeHtml(phone));
    signatureHtml = signatureHtml.replace(/{FAX}/g, escapeHtml(fax));
    signatureHtml = signatureHtml.replace(/{EMAIL}/g, escapeHtml(email));

    // 6. Set Signature
    Office.context.mailbox.item.body.setSignatureAsync(
      signatureHtml,
      { coercionType: Office.CoercionType.Html },
      function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error(
            "Failed to set signature: " + asyncResult.error.message
          );
        }
        if (event) event.completed();
      }
    );
  } catch (error) {
    console.error("Error in signature logic:", error);
    if (event) event.completed({ allowEvent: true });
  }
}

// === GROUP CHECK LOGIC ===
async function checkUserIsLawyer() {
  try {
    const options = {
      allowSignInPrompt: true,
      allowConsentPrompt: true,
      forMSGraphAccess: true,
    };
    const bootstrapToken = await Office.auth.getAccessToken(options);

    // Call YOUR Backend Service with this token
    // The backend should return { isMember: boolean, jobTitle: string, mobilePhone: string }
    /*
        const response = await fetch("https://signatures.your-domain.com/api/user-info", {
            method: "POST",
            headers: { "Authorization": `Bearer ${bootstrapToken}` ... },
            body: JSON.stringify({ groupId: LAWYER_GROUP_ID })
        });
        return await response.json(); 
        */

    // MOCK RETURN:
    console.log("Got token. Backend logic required.");
    return {
      isMember: false,
      jobTitle: "IT Staff",
      mobilePhone: "050-1234567",
    };
  } catch (exception) {
    console.error("Failed to check group membership:", exception);
    return { isMember: false };
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

if (typeof self !== "undefined") {
  self.checkSignature = checkSignature;
  self.setSignature = setSignature;
}

Office.onReady(() => {
  if (Office.actions) {
    Office.actions.associate("checkSignature", checkSignature);
  }
});

module.exports = { checkSignature, setSignature };
```

---

## 2. Server Setup: Cloudflare Tunnel (Recommended)

You asked about using your local IP (`192.168.x.x`). **This will not work for Production** for two reasons:

1.  **SSL Requirement**: Outlook Add-ins require a trusted HTTPS certificate. You cannot get a valid public certificate (like Digicert or Let's Encrypt) for a private IP address.
2.  **Connectivity**: `192.168.x.x` is not accessible from the public internet (where Exchange Online lives).

**Solution**: Use **Cloudflare Tunnel**.
It connects your local machine to the public internet securely without opening firewall ports.

### Prerequisites

- A domain name (e.g., `md-signatures.com`) managed on Cloudflare.
- A Cloudflare account (Free tier is fine).

### Step 2.1: Install `cloudflared`

On your Debian server:

```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

### Step 2.2: Authenticate & Create Tunnel

```bash
cloudflared tunnel login
# (Copy the URL provided and login in your browser)

# Create a tunnel named 'outlook-addin'
cloudflared tunnel create outlook-addin
# Note the Tunnel ID (UUID) returned
```

### Step 2.3: Configure the Tunnel

Create a config file `~/.cloudflared/config.yml`:

```yaml
tunnel: <Your-Tunnel-UUID>
credentials-file: /home/debian/.cloudflared/<Your-Tunnel-UUID>.json

ingress:
  # Route traffic to your Docker app
  - hostname: signatures.your-domain.com
    service: https://localhost:3000
    originRequest:
      noTLSVerify: true
      # "noTLSVerify: true" allows Cloudflare to talk to your self-signed local cert
  - service: http_status:404
```

### Step 2.4: Route DNS

```bash
cloudflared tunnel route dns outlook-addin signatures.your-domain.com
```

### Step 2.5: Run the Tunnel

```bash
sudo cloudflared tunnel run outlook-addin
```

_Tip: Use `systemctl` to run this as a service so it stays up on reboot._

---

## 3. Azure Application (for Graph API)

Since we are using Graph API to get `JobTitle` and `GroupMembership`, you must register an App in Azure AD.

1.  **Register App**: Azure Portal -> App Registrations.
2.  **Redirect URI**: SPA -> `https://signatures.your-domain.com/autorunweb.html` (and `taskpane.html`).
3.  **API Permissions**:
    - `GroupMember.Read.All`
    - `User.Read.All` (To read Job Title/Phone of the user)
4.  **Expose API**: `api://signatures.your-domain.com/<APP_ID>`

---

## 4. Final Manifest Configuration

1.  Open `manifest.xml`.
2.  Replace all `https://localhost:3000` with `https://signatures.your-domain.com`.
3.  Add the SSO Info at the bottom of `VersionOverrides`:

```xml
<WebApplicationInfo>
    <Id>YOUR_AZURE_APP_ID</Id>
    <Resource>api://signatures.your-domain.com/YOUR_AZURE_APP_ID</Resource>
    <Scopes>
        <Scope>GroupMember.Read.All</Scope>
        <Scope>User.Read.All</Scope>
        <Scope>profile</Scope>
        <Scope>openid</Scope>
    </Scopes>
</WebApplicationInfo>
```

4.  **Validate & Deploy** via M365 Admin Center.
