/**
 * Email template for booking confirmations
 * @param {Object} data - Booking data
 * @returns {string} HTML email content
 */
const bookingConfirmationTemplate = (data) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 5px; border-top: 4px solid #4A6FA5;">
          <h2 style="color: #4A6FA5; margin-top: 0;">Booking Confirmation</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for booking with Werent Real Estate. Your booking has been confirmed!</p>
          
          <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0; border-left: 4px solid #4A6FA5;">
            <h3 style="margin-top: 0; color: #4A6FA5;">Booking Details</h3>
            <p><strong>Reference:</strong> ${data.bookingReference}</p>
            <p><strong>Date Booked:</strong> ${data.bookingDate}</p>
            <p><strong>Property:</strong> ${data.propertyName}</p>
            <p><strong>Check-in:</strong> ${data.checkInDate}</p>
            <p><strong>Check-out:</strong> ${data.checkOutDate}</p>
            <p><strong>Duration:</strong> ${data.nights} night(s)</p>
            <p><strong>Guests:</strong> ${data.adults} adult(s)${data.children > 0 ? `, ${data.children} child(ren)` : ''}</p>
            <p><strong>Total Price:</strong> Ksh ${data.totalPrice.toFixed(2)}</p>
          </div>
  
          <p>We look forward to welcoming you. If you have any questions or need to make changes to your booking, please contact us.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin-bottom: 5px;"><strong>Werent Real Estate</strong></p>
            <p style="margin-top: 0; color: #666;">Email: werent@werentonline.com</p>
            <p style="margin-top: 0; color: #666;">Phone: 0708129949</p>
            <p style="margin-top: 0; color: #666;">Website: www.werentonline.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  /**
   * Email template for viewing appointment confirmations
   * @param {Object} data - Viewing appointment data
   * @returns {string} HTML email content
   */
  const viewingConfirmationTemplate = (data) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Viewing Appointment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 5px; border-top: 4px solid #4A6FA5;">
          <h2 style="color: #4A6FA5; margin-top: 0;">Viewing Appointment Confirmation</h2>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for scheduling a viewing with Werent Real Estate. Your appointment has been confirmed!</p>
          
          <div style="background-color: white; border-radius: 5px; padding: 15px; margin: 20px 0; border-left: 4px solid #4A6FA5;">
            <h3 style="margin-top: 0; color: #4A6FA5;">Appointment Details</h3>
            <p><strong>Reference:</strong> ${data.viewingReference}</p>
            <p><strong>Date Requested:</strong> ${data.requestDate}</p>
            <p><strong>Property:</strong> ${data.propertyName}</p>
            <p><strong>Type:</strong> ${data.propertyType}</p>
            <p><strong>Address:</strong> ${data.propertyAddress}</p>
            <p><strong>Appointment Date:</strong> ${data.appointmentDate}</p>
            <p><strong>Appointment Time:</strong> ${data.appointmentTime}</p>
            <p><strong>Your Notes:</strong> ${data.notes}</p>
          </div>
  
          <p>Our agent will contact you to confirm this appointment. If you need to reschedule or have any questions, please contact us.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin-bottom: 5px;"><strong>Werent Real Estate</strong></p>
            <p style="margin-top: 0; color: #666;">Email: werent@werentonline.com</p>
            <p style="margin-top: 0; color: #666;">Phone: (555) 123-4567</p>
            <p style="margin-top: 0; color: #666;">Website: www.werentonline.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };
  
  module.exports = {
    bookingConfirmationTemplate,
    viewingConfirmationTemplate
  };