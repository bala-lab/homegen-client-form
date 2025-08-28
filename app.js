// Homegen Interior Design Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('clientForm');
    const successMessage = document.getElementById('successMessage');
    const submitButton = form.querySelector('button[type="submit"]');

    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    // Form validation function
    function validateForm() {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        // Clear previous error states
        clearErrors();
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required');
                isValid = false;
            }
        });

        // Email validation
        const emailField = document.getElementById('email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }

        // Phone number validation (if provided)
        const phoneField = document.getElementById('contactNumber');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone validation helper
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }

    // Show field error
    function showFieldError(field, message) {
        field.classList.add('invalid');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    // Clear all errors
    function clearErrors() {
        const invalidFields = form.querySelectorAll('.invalid');
        const errorMessages = form.querySelectorAll('.error-message');
        
        invalidFields.forEach(field => field.classList.remove('invalid'));
        errorMessages.forEach(error => error.remove());
    }

    // Submit form function
    function submitForm() {
        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        // Collect form data
        const formData = collectFormData();

        // Build a mailto link so the client can send the form data via their default email client
        const mailtoLink = createMailtoLink(formData);

        // Attempt to open the user's default mail application with the pre‑filled message
        // Using window.location.href ensures the current page navigates to the mailto link
        window.location.href = mailtoLink;

        // After triggering the mail client, display a success message and reset the form state
        setTimeout(() => {
            console.log('Form Data Collected:', formData);

            // Hide form and show success message
            form.style.display = 'none';
            successMessage.classList.remove('hidden');

            // Reset loading state
            submitButton.classList.remove('loading');
            submitButton.disabled = false;

            // Scroll to top
            window.scrollTo(0, 0);
        }, 500);
    }

    /**
     * Create a mailto link containing the form submission details.  This link
     * opens the user's default mail client with a subject and body populated
     * from the form data.  The recipient defaults to the configured
     * recipientEmail property on the form data but falls back to the
     * hard‑coded address used by Homegen.
     *
     * @param {Object} data The collected form submission data.
     * @returns {string} A formatted mailto link with encoded subject and body.
     */
    function createMailtoLink(data) {
        // Determine the recipient address.  Use the explicit recipientEmail
        // from the collected data if available, otherwise fall back to
        // balamurali.deva@gmail.com.
        const recipient = data.recipientEmail || data.basicInformation.recipientEmail || 'balamurali.deva@gmail.com';

        // Construct the email subject.  Include the client's name when
        // available for easier identification of submissions.
        const name = data.basicInformation.name || 'Client';
        const subject = `New client requirements submission from ${name}`;

        // Build the email body with clear section headings and values.  Each
        // line break is encoded later when building the final mailto string.
        let body = '';
        body += 'Basic Information:\n';
        body += `Name: ${data.basicInformation.name || ''}\n`;
        body += `Property Name: ${data.basicInformation.propertyName || ''}\n`;
        body += `Location: ${data.basicInformation.location || ''}\n`;
        body += `Contact Number: ${data.basicInformation.contactNumber || ''}\n`;
        body += `Client Email: ${data.basicInformation.email || ''}\n\n`;

        body += 'Project Details:\n';
        body += `Handing Over Status: ${data.projectDetails.handingOverStatus || ''}\n`;
        body += `Property Type: ${data.projectDetails.propertyType || ''}\n`;
        body += `Total Area: ${data.projectDetails.totalArea || ''}\n`;
        body += `Number of Rooms: ${data.projectDetails.numberOfRooms || ''}\n\n`;

        body += 'Budget & Timeline:\n';
        body += `Budget Range: ${data.budgetTimeline.budgetRange || ''}\n`;
        body += `Preferred Meeting Time: ${data.budgetTimeline.meetingTime || ''}\n`;
        body += `Project Timeline: ${data.budgetTimeline.projectTimeline || ''}\n\n`;

        body += 'Design Preferences:\n';
        body += `Interior Style: ${Array.isArray(data.designPreferences.interiorStyle) && data.designPreferences.interiorStyle.length ? data.designPreferences.interiorStyle.join(', ') : ''}\n`;
        body += `Rooms to Design: ${Array.isArray(data.designPreferences.roomsToDesign) && data.designPreferences.roomsToDesign.length ? data.designPreferences.roomsToDesign.join(', ') : ''}\n`;
        body += `Color Preferences: ${Array.isArray(data.designPreferences.colorPreferences) && data.designPreferences.colorPreferences.length ? data.designPreferences.colorPreferences.join(', ') : ''}\n\n`;

        body += 'Special Requirements:\n';
        body += `${data.requirements.specialRequirements || ''}\n\n`;

        body += 'Inspiration / References:\n';
        body += `${data.requirements.inspiration || ''}\n\n`;

        body += 'Additional Services:\n';
        body += `${Array.isArray(data.additionalServices) && data.additionalServices.length ? data.additionalServices.join(', ') : 'None'}\n\n`;

        body += `Submitted At: ${data.submittedAt || ''}\n`;

        // Encode subject and body for URL safety.  Replace spaces and newlines
        // with appropriate percent‑encoded values so they are preserved when
        // the mail client interprets the URL.
        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);

        return `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;
    }

    // Collect all form data
    function collectFormData() {
        const data = {
            basicInformation: {
                name: document.getElementById('name').value,
                propertyName: document.getElementById('propertyName').value,
                location: document.getElementById('location').value,
                contactNumber: document.getElementById('contactNumber').value,
                email: document.getElementById('email').value
            },
            projectDetails: {
                handingOverStatus: document.getElementById('handingOverStatus').value,
                propertyType: document.getElementById('propertyType').value,
                totalArea: document.getElementById('totalArea').value,
                numberOfRooms: document.getElementById('numberOfRooms').value
            },
            budgetTimeline: {
                budgetRange: document.getElementById('budgetRange').value,
                meetingTime: document.getElementById('meetingTime').value,
                projectTimeline: document.getElementById('projectTimeline').value
            },
            designPreferences: {
                interiorStyle: getCheckedValues('interiorStyle'),
                roomsToDesign: getCheckedValues('roomsToDesign'),
                colorPreferences: getCheckedValues('colorPreferences')
            },
            requirements: {
                specialRequirements: document.getElementById('specialRequirements').value,
                inspiration: document.getElementById('inspiration').value
            },
            additionalServices: getCheckedValues('additionalServices'),
            submittedAt: new Date().toISOString(),
            recipientEmail: 'balamurali.deva@gmail.com'
        };

        return data;
    }

    // Get checked checkbox values
    function getCheckedValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Reset form function (called from success message)
    window.resetForm = function() {
        // Hide success message
        successMessage.classList.add('hidden');
        
        // Show form
        form.style.display = 'block';
        
        // Reset form fields
        form.reset();
        
        // Clear any validation errors
        clearErrors();
        
        // Scroll to top
        window.scrollTo(0, 0);
    };

    // Add smooth scrolling for better UX
    const sections = document.querySelectorAll('.form-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Apply initial animation styles and observe sections
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Handle "All Rooms" checkbox logic
    const allRoomsCheckbox = document.querySelector('input[name="roomsToDesign"][value="all-rooms"]');
    const otherRoomCheckboxes = document.querySelectorAll('input[name="roomsToDesign"]:not([value="all-rooms"])');

    if (allRoomsCheckbox) {
        allRoomsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                otherRoomCheckboxes.forEach(cb => {
                    cb.checked = false;
                    cb.disabled = true;
                });
            } else {
                otherRoomCheckboxes.forEach(cb => {
                    cb.disabled = false;
                });
            }
        });

        otherRoomCheckboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                if (this.checked && allRoomsCheckbox.checked) {
                    allRoomsCheckbox.checked = false;
                    otherRoomCheckboxes.forEach(ocb => {
                        ocb.disabled = false;
                    });
                }
            });
        });
    }

    // Auto-save form data to prevent data loss (using sessionStorage)
    const formFields = form.querySelectorAll('input, select, textarea');
    
    // Load saved data on page load
    loadSavedData();
    
    // Save data on input changes
    formFields.forEach(field => {
        field.addEventListener('input', saveFormData);
        field.addEventListener('change', saveFormData);
    });

    function saveFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Handle regular form fields
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Save to sessionStorage
        sessionStorage.setItem('homegenFormData', JSON.stringify(data));
    }

    function loadSavedData() {
        const savedData = sessionStorage.getItem('homegenFormData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Restore form field values
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            const checkboxes = form.querySelectorAll(`[name="${key}"]`);
                            const values = Array.isArray(data[key]) ? data[key] : [data[key]];
                            checkboxes.forEach(cb => {
                                cb.checked = values.includes(cb.value);
                            });
                        } else {
                            field.value = data[key];
                        }
                    }
                });
            } catch (e) {
                console.log('Could not restore saved form data');
            }
        }
    }

    // Clear saved data on successful submission
    form.addEventListener('submit', function() {
        if (validateForm()) {
            setTimeout(() => {
                sessionStorage.removeItem('homegenFormData');
            }, 2000);
        }
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Escape key closes success modal
        if (e.key === 'Escape' && !successMessage.classList.contains('hidden')) {
            resetForm();
        }
    });

    // Add focus management for accessibility
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // When success message is shown, focus management
    const successModal = successMessage;
    successModal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusable = successModal.querySelectorAll(focusableElements);
            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });

    console.log('Homegen Interior Design Form initialized successfully');
});