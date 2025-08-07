document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordField = document.getElementById('password');
    const copyBtn = document.getElementById('copy-btn');
    const generateBtn = document.getElementById('generate');
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strength-text');
    const toast = document.getElementById('toast');

    // Character sets
    const characterSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // Update length value display
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
    });

    // Generate password
    generateBtn.addEventListener('click', () => {
        const length = parseInt(lengthSlider.value);
        const options = {
            uppercase: uppercaseCheckbox.checked,
            lowercase: lowercaseCheckbox.checked,
            numbers: numbersCheckbox.checked,
            symbols: symbolsCheckbox.checked
        };

        if (!Object.values(options).some(opt => opt)) {
            showToast('Please select at least one character type');
            return;
        }

        const password = generatePassword(length, options);
        passwordField.textContent = password;
        updatePasswordStrength(password);
    });

    // Copy password to clipboard
    copyBtn.addEventListener('click', () => {
        if (passwordField.textContent === 'Click "Generate Password"') {
            showToast('Generate a password first');
            return;
        }

        navigator.clipboard.writeText(passwordField.textContent)
            .then(() => {
                showToast('Password copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy password');
            });
    });

    // Generate password function
    function generatePassword(length, options) {
        let characters = '';
        let guaranteedChars = '';
        
        // Build character pool and guaranteed characters
        for (const [key, value] of Object.entries(options)) {
            if (value) {
                characters += characterSets[key];
                // Ensure at least one character from each selected set
                guaranteedChars += characterSets[key].charAt(
                    Math.floor(Math.random() * characterSets[key].length)
                );
            }
        }
        
        // Fill the rest with random characters
        let password = '';
        for (let i = 0; i < length - guaranteedChars.length; i++) {
            password += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }
        
        // Add guaranteed characters and shuffle
        password += guaranteedChars;
        return shuffleString(password);
    }

    // Shuffle string function
    function shuffleString(string) {
        const array = string.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    // Update password strength indicator
    function updatePasswordStrength(password) {
        const strength = calculatePasswordStrength(password);
        const strengthPercent = Math.min(100, strength.score * 25);
        
        // Update strength bar and text
        let color, text;
        if (strengthPercent < 25) {
            color = 'danger';
            text = 'Very Weak';
        } else if (strengthPercent < 50) {
            color = 'warning';
            text = 'Weak';
        } else if (strengthPercent < 75) {
            color = 'success';
            text = 'Good';
        } else {
            color = 'primary';
            text = 'Strong';
        }
        
        strengthBar.style.setProperty('--strength-width', `${strengthPercent}%`);
        strengthBar.style.setProperty('--strength-color', `var(--${color})`);
        strengthText.textContent = text;
        strengthText.className = `text-xs mt-1 text-${color}`;
    }

    // Calculate password strength
    function calculatePasswordStrength(password) {
        let score = 0;
        
        // Length score
        score += Math.min(4, Math.floor(password.length / 3));
        
        // Character variety score
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^A-Za-z0-9]/.test(password);
        
        const varietyCount = [hasUpper, hasLower, hasNumber, hasSymbol]
            .filter(Boolean).length;
        score += (varietyCount - 1) * 2;
        
        // Deductions for repeated characters
        const repeatChars = (password.match(/(.)\1+/g) || []).length;
        score -= repeatChars * 0.5;
        
        // Deductions for common patterns
        const commonPatterns = [
            '123', 'abc', 'qwerty', 'password', '111', '000'
        ];
        if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
            score -= 2;
        }
        
        return {
            score: Math.max(1, score),
            length: password.length,
            hasUpper,
            hasLower,
            hasNumber,
            hasSymbol
        };
    }

    // Show toast notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Generate initial password
    generateBtn.click();
});
