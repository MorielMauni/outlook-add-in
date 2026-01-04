export function getHebrewSignature(user) {
    return `
    <div dir="rtl" style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif;">
        <table dir="rtl" cellspacing="0" cellpadding="0" style="font-family: 'Segoe UI', Arial, sans-serif; color: #1f2a44; text-align: right; direction: rtl; width: auto;">
            <tr>
                <td style="vertical-align: middle; padding-left: 10px;">
                    <img src="https://localhost:3000/assets/logo.png" alt="Company Logo" width="120" style="display: block; border: 0;">
                </td>
                <td style="vertical-align: top; padding-right: 0px;">
                    <table cellspacing="0" cellpadding="0">
                        <tr>
                            <td style="font-weight: bold; font-size: 18px; color: #1f2a44; padding-bottom: 4px;">
                                ${user.displayName}
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size: 14px; color: #555; padding-bottom: 8px;">
                                ${user.jobTitle || '{ROLE}'}
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 2px; background-color: #f2ae2e; font-size: 0; line-height: 0; width: 100%; display: block;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="padding-top: 8px; font-size: 12px; color: #1f2a44;">
                                <span style="display: inline-block;">${user.phone || '{PHONE}'}</span>
                                <span style="color: #f2ae2e; font-weight: bold; margin: 0 5px;">|</span>
                                <span style="display: inline-block;">{FAX}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size: 12px; padding-top: 2px;">
                                <a href="mailto:${user.emailAddress}" style="color: #4a68b5; text-decoration: none;">${user.emailAddress}</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>`;
}

export function getEnglishSignature(user) {
    return `
    <table dir="ltr" cellspacing="0" cellpadding="0" style="font-family: 'Segoe UI', Arial, sans-serif; color: #1f2a44; text-align: left; direction: ltr;">
        <tr>
            <td style="vertical-align: middle; padding-right: 10px;">
                <img src="https://localhost:3000/assets/logo-eng.png" alt="Company Logo" width="120" style="display: block; border: 0;">
            </td>
            <td style="vertical-align: top; padding-left: 0px;">
                <table cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="font-weight: bold; font-size: 18px; color: #1f2a44; padding-bottom: 4px;">
                            ${user.displayName}
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 14px; color: #555; padding-bottom: 8px;">
                            ${user.jobTitle || '{ROLE}'}
                        </td>
                    </tr>
                    <tr>
                        <td style="height: 2px; background-color: #f2ae2e; font-size: 0; line-height: 0; width: 100%; display: block;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding-top: 8px; font-size: 12px; color: #1f2a44;">
                            <span style="display: inline-block;">${user.phone || '{PHONE}'}</span>
                            <span style="color: #f2ae2e; font-weight: bold; margin: 0 5px;">|</span>
                            <span style="display: inline-block;">{FAX}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size: 12px; padding-top: 2px;">
                            <a href="mailto:${user.emailAddress}" style="color: #4a68b5; text-decoration: none;">${user.emailAddress}</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>`;
}
