document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  let form = document.getElementById('compose-form');

  // Send email
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // certificate that there has no empty values
    if (!recipients || !subject || !body) {
      alert('Please fill in all fields');
      return
    }
    // Make a POST request to send an email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to send email.');
      }
    })
    .then((data) => {
      alert('Email sent successfully.');
      window.location.href = '/'; 
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Failed to send email.');
      // Reload the page
    });
    
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the mailbox
  emais = fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    emails.forEach(email => {
      const sender = email.sender;
      const recipients = email.recipients;
      const subject = email.subject;
      const timestamp = email.timestamp;
      const body = email.body;
      const id = email.id;

      //Create a div for each email
      const element = document.createElement('div');
      if (email.read) {
        element.style.backgroundColor = 'lightgray';
        element.style.border = '1px solid black';
        element.style.cursor = 'pointer';
      } else {
        element.style.backgroundColor = 'white';
        element.style.border = '1px solid black';
        element.style.fontWeight = 'bold';
        element.style.cursor = 'pointer';
      }

      element.innerHTML = `<div>From: ${sender},  To: ${recipients}</div>`;
      element.addEventListener('click', () => {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#email-view').style.display = 'block';
        document.querySelector('#email-view').innerHTML = `<h3>From: ${sender} To: ${recipients}</h3><hr>
        <div>${subject}</div><div>${body}</div><span>${timestamp}</span><br>`;
        
        // Create a reply button
        var button = document.createElement('button');
        button.innerHTML = 'Reply';
        document.querySelector('#email-view').append(button);
        button.addEventListener('click', () => {
          compose_email();
          document.querySelector('#compose-recipients').value = `${sender}`
          document.querySelector('#compose-subject').value = `Re: ${subject}`
          document.querySelector('#compose-body').placeholder = `On ${timestamp} ${sender} wrote: ${body}`;
        })
        // Mark the email as read
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        
      });
      document.querySelector('#emails-view').append(element);
      
      // Create a archive button for each email
      var button = document.createElement('button');
      if (email.archived) {
        button.innerHTML = 'Unarchive';
      } else {
        button.innerHTML = 'Archive';
      }
      button.addEventListener('click', () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        // Reload the page
        if (mailbox === 'archive')
        {
          mailbox = 'archived'
        }
        var page = document.querySelector('#' + mailbox);
        page.click();
      });
      // Append element
      document.querySelector('#emails-view').append(button);

      

  })
})
}