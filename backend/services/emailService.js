const sgMail = require('@sendgrid/mail');
const emailTemplates = require('../utils/emailTemplates');

// Configure SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Plain text version (optional)
 * @returns {Promise} - SendGrid API response
 */
const sendEmail = async (options) => {
  try {
    const msg = {
      to: options.to,
      from: {
        email: process.env.FROM_EMAIL || 'werent@werentonline.com',
        name: process.env.FROM_NAME || 'Werent Real Estate'
      },
      subject: options.subject,
      text: options.text || 'Please view this email in an HTML compatible email client',
      html: options.html,
      replyTo: process.env.REPLY_TO_EMAIL || 'werent@werentonline.com'
    };

    const response = await sgMail.send(msg);
    console.log('Email sent successfully');
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    if (error.response) {
      console.error('SendGrid API error:', error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send booking confirmation email to customer
 * @param {Object} booking - Booking object with customer and property details
 * @returns {Promise} - SendGrid API response
 */
const sendBookingConfirmation = async (booking) => {
  try {
    // Format check-in and check-out dates
    const checkInDate = new Date(booking.checkInDate).toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

    // Calculate total nights
    const nights = Math.ceil(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / 
      (1000 * 60 * 60 * 24)
    );

    // Get property details
    const property = booking.propertyId;
    
    // Prepare data for email template
    const emailData = {
      customerName: booking.fullName,
      propertyName: property.title,
      propertyAddress: property.location.address,
      propertyType: property.type,
      checkInDate,
      checkOutDate,
      nights,
      adults: booking.numberOfAdults,
      children: booking.numberOfChildren || 0,
      totalPrice: property.price * nights,
      bookingReference: booking._id.toString(),
      bookingDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    };

    // Generate email content from template
    const htmlContent = emailTemplates.bookingConfirmationTemplate(emailData);
    
    // Send email
    return await sendEmail({
      to: booking.email,
      subject: 'Your Booking Confirmation - Werent Real Estate',
      html: htmlContent
    });
  } catch (error) {
    console.error('Booking confirmation email error:', error);
    throw error;
  }
};

/**
 * Send viewing appointment confirmation email
 * @param {Object} viewing - Viewing object with customer and property details
 * @returns {Promise} - SendGrid API response
 */
const sendViewingConfirmation = async (viewing) => {
  try {
    // Format preferred date and time
    const appointmentDate = new Date(viewing.preferredDate).toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });

    // Format time
    const appointmentTime = viewing.preferredTime;

    // Get property details
    const property = viewing.propertyId;
    
    // Prepare data for email template
    const emailData = {
      customerName: viewing.fullName,
      propertyName: property.title,
      propertyAddress: property.location.address,
      propertyType: property.type,
      appointmentDate,
      appointmentTime,
      notes: viewing.notes || 'No additional notes provided.',
      viewingReference: viewing._id.toString(),
      requestDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })
    };

    // Generate email content from template
    const htmlContent = emailTemplates.viewingConfirmationTemplate(emailData);
    
    // Send email
    return await sendEmail({
      to: viewing.email,
      subject: 'Your Viewing Appointment Confirmation - Werent Real Estate',
      html: htmlContent
    });
  } catch (error) {
    console.error('Viewing confirmation email error:', error);
    throw error;
  }
};

/**
 * Send test email (for API key verification)
 * @param {string} to - Recipient email
 * @returns {Promise} - SendGrid API response
 */
const sendTestEmail = async (to) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #4A6FA5;">SendGrid Test Email</h2>
        <p>This is a test email from Werent Real Estate application.</p>
        <p>If you're receiving this, your SendGrid configuration is working properly!</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    `;
    
    return await sendEmail({
      to,
      subject: 'SendGrid Test Email - Werent Real Estate',
      html: htmlContent
    });
  } catch (error) {
    console.error('Test email error:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendViewingConfirmation,
  sendTestEmail
};