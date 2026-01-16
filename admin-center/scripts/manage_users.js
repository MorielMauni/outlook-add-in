const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);
const command = args[0];
const username = args[1];
const password = args[2];

function printUsage() {
    console.log('Usage:');
    console.log('  node manage_users.js hash <password>');
    console.log('  node manage_users.js add <username> <password>');
}

if (command === 'hash') {
    if (!username) { // In this case, username arg is the password
        printUsage();
        process.exit(1);
    }
    const plainPassword = username; 
    const hash = bcrypt.hashSync(plainPassword, 10);
    console.log(`Hash for password "${plainPassword}":`);
    console.log(hash);
} else if (command === 'add') {
    if (!username || !password) {
        printUsage();
        process.exit(1);
    }
    const hash = bcrypt.hashSync(password, 10);
    console.log('Add the following to config/users.js:');
    console.log(`"${username}": "${hash}"`);
} else {
    printUsage();
}
