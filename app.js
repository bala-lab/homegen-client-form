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
        
        // Simulate form processing (in real implementation, this would send data to server)
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
        }, 1500);
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