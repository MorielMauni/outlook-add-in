/* global Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    document.getElementById("btn-hebrew").onclick = () => setSignature("hebrew");
    document.getElementById("btn-english").onclick = () => setSignature("english");
  }
});

async function setSignature(type) {
  const baseUrl = "https://localhost:3000/assets/";
  const fileName = type === 'hebrew' ? "signature-hebrew.html" : "signature-english.html";
  const url = baseUrl + fileName;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load signature file: ${response.statusText}`);
    }
    const signatureHtml = await response.text();

    Office.context.mailbox.item.body.setSignatureAsync(
      signatureHtml,
      { coercionType: Office.CoercionType.Html },
      function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error("Failed to set signature: " + asyncResult.error.message);
        } else {
          console.log("Signature set to " + type);
        }
      }
    );
  } catch (error) {
    console.error("Error setting signature:", error);
  }
}
