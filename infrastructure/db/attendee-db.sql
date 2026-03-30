CREATE TABLE IF NOT EXISTS attendees (
      id SERIAL PRIMARY KEY,
      user_id UUID,
      event_id BIGINT,
      status VARCHAR(20) DEFAULT 'rsvp',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );