const fs = require('fs');

const files = [
    'src/components/FadeIn.tsx',
    'src/components/Contact.tsx',
    'src/components/Header.tsx',
    'src/components/HolidayNotification.tsx',
    'src/components/Menu.tsx',
    'src/components/MenuItemModal.tsx',
    'src/components/MobileStickyCart.tsx',
    'src/components/OpenStatus.tsx',
    'src/components/Reviews.tsx',
    'src/hooks/useBodyScrollLock.ts'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        const original = fs.readFileSync(file, 'utf8');
        if (!original.includes('"use client"')) {
            fs.writeFileSync(file, '"use client";\n' + original);
            console.log('Added use client to ' + file);
        }
    }
}
