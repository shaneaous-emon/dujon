-- DUJON initial schema (docs/07). MySQL >= 8.0.16 (CHECK enforced); also runs on MariaDB >= 10.5 for local development.
-- Collation note: utf8mb4_unicode_ci is used instead of utf8mb4_0900_ai_ci so the same migration runs on MySQL 8 and MariaDB.

CREATE TABLE divisions (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  name_en VARCHAR(60) NOT NULL,
  name_bn VARCHAR(60) NOT NULL,
  UNIQUE KEY uq_divisions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE districts (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  division_id TINYINT UNSIGNED NOT NULL,
  code VARCHAR(10) NOT NULL,
  name_en VARCHAR(60) NOT NULL,
  name_bn VARCHAR(60) NOT NULL,
  UNIQUE KEY uq_districts_code (code),
  UNIQUE KEY uq_districts_id_division (id, division_id),
  KEY idx_districts_division (division_id),
  CONSTRAINT fk_districts_division FOREIGN KEY (division_id) REFERENCES divisions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE upazilas (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  district_id SMALLINT UNSIGNED NOT NULL,
  code VARCHAR(12) NOT NULL,
  name_en VARCHAR(80) NOT NULL,
  name_bn VARCHAR(80) NOT NULL,
  type ENUM('upazila','thana') NOT NULL DEFAULT 'upazila',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_upazilas_code (code),
  UNIQUE KEY uq_upazilas_id_district (id, district_id),
  KEY idx_upazilas_district (district_id),
  CONSTRAINT fk_upazilas_district FOREIGN KEY (district_id) REFERENCES districts (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  email_verified_at DATETIME(3) NULL,
  password_hash VARCHAR(255) NULL,
  full_name VARCHAR(80) NULL,
  mobile_e164 VARCHAR(16) NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  status ENUM('active','suspended','pending_deletion','deleted') NOT NULL DEFAULT 'active',
  preferred_locale ENUM('bn','en') NOT NULL DEFAULT 'bn',
  notify_interest_received TINYINT(1) NOT NULL DEFAULT 1,
  notify_interest_accepted TINYINT(1) NOT NULL DEFAULT 1,
  terms_version VARCHAR(20) NOT NULL,
  privacy_version VARCHAR(20) NOT NULL,
  terms_accepted_at DATETIME(3) NOT NULL,
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  last_login_at DATETIME(3) NULL,
  deletion_requested_at DATETIME(3) NULL,
  deleted_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_status_deletion (status, deletion_requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
  id CHAR(64) NOT NULL PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_used_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  user_agent VARCHAR(255) NULL,
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auth_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('email_verify','password_reset') NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  used_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_auth_tokens_hash (token_hash),
  KEY idx_auth_tokens_user_type (user_id, type),
  CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  public_id CHAR(12) NOT NULL,
  display_name VARCHAR(40) NOT NULL,
  gender ENUM('male','female') NOT NULL,
  date_of_birth DATE NOT NULL,
  created_by ENUM('self','parent','guardian','sibling','relative') NOT NULL DEFAULT 'self',
  marital_status ENUM('never_married','divorced','widowed') NULL,
  height_cm SMALLINT UNSIGNED NULL,
  education_level ENUM('below_ssc','ssc','hsc','diploma','bachelors','masters','doctorate','other') NULL,
  education_detail VARCHAR(100) NULL,
  occupation VARCHAR(100) NULL,
  division_id TINYINT UNSIGNED NULL,
  district_id SMALLINT UNSIGNED NULL,
  upazila_id SMALLINT UNSIGNED NULL,
  about VARCHAR(1000) NULL,
  family_info VARCHAR(500) NULL,
  photo_visibility ENUM('members','connections') NOT NULL DEFAULT 'members',
  status ENUM('draft','published','hidden','suspended') NOT NULL DEFAULT 'draft',
  onboarding_step TINYINT UNSIGNED NOT NULL DEFAULT 0,
  published_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_profiles_user (user_id),
  UNIQUE KEY uq_profiles_public (public_id),
  KEY idx_disc_base (status, gender, date_of_birth),
  KEY idx_disc_division (status, gender, division_id, date_of_birth),
  KEY idx_disc_district (status, gender, district_id, date_of_birth),
  KEY idx_disc_upazila (status, gender, upazila_id, date_of_birth),
  KEY idx_disc_recent (status, gender, published_at, id),
  CONSTRAINT chk_profiles_height CHECK (height_cm IS NULL OR height_cm BETWEEN 120 AND 220),
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_profiles_division FOREIGN KEY (division_id) REFERENCES divisions (id),
  CONSTRAINT fk_profiles_district FOREIGN KEY (district_id, division_id) REFERENCES districts (id, division_id),
  CONSTRAINT fk_profiles_upazila FOREIGN KEY (upazila_id, district_id) REFERENCES upazilas (id, district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE profile_photos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id CHAR(16) NOT NULL,
  profile_id BIGINT UNSIGNED NOT NULL,
  storage_key_full VARCHAR(200) NOT NULL,
  storage_key_thumb VARCHAR(200) NOT NULL,
  width SMALLINT UNSIGNED NOT NULL,
  height SMALLINT UNSIGNED NOT NULL,
  bytes INT UNSIGNED NOT NULL,
  moderation_status ENUM('approved','pending','rejected') NOT NULL DEFAULT 'approved',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_photos_public (public_id),
  UNIQUE KEY uq_photos_profile (profile_id),
  CONSTRAINT fk_photos_profile FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partner_preferences (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  age_min TINYINT UNSIGNED NOT NULL,
  age_max TINYINT UNSIGNED NOT NULL,
  division_id TINYINT UNSIGNED NULL,
  district_id SMALLINT UNSIGNED NULL,
  upazila_id SMALLINT UNSIGNED NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT chk_pref_age CHECK (age_min >= 18 AND age_max <= 100 AND age_min <= age_max),
  CONSTRAINT fk_pref_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_pref_division FOREIGN KEY (division_id) REFERENCES divisions (id),
  CONSTRAINT fk_pref_district FOREIGN KEY (district_id, division_id) REFERENCES districts (id, division_id),
  CONSTRAINT fk_pref_upazila FOREIGN KEY (upazila_id, district_id) REFERENCES upazilas (id, district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  sender_id BIGINT UNSIGNED NOT NULL,
  receiver_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','accepted','declined','withdrawn','ended') NOT NULL DEFAULT 'pending',
  ended_reason ENUM('blocked','account_deleted','suspended') NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  responded_at DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_interests_pair (sender_id, receiver_id),
  KEY idx_int_receiver (receiver_id, status, created_at),
  KEY idx_int_sender (sender_id, status, created_at),
  KEY idx_int_sender_recent (sender_id, created_at),
  CONSTRAINT chk_interests_self CHECK (sender_id <> receiver_id),
  CONSTRAINT fk_interests_sender FOREIGN KEY (sender_id) REFERENCES users (id),
  CONSTRAINT fk_interests_receiver FOREIGN KEY (receiver_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saved_profiles (
  user_id BIGINT UNSIGNED NOT NULL,
  saved_user_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, saved_user_id),
  KEY idx_saved_target (saved_user_id),
  CONSTRAINT chk_saved_self CHECK (user_id <> saved_user_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_saved_target FOREIGN KEY (saved_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE blocks (
  blocker_id BIGINT UNSIGNED NOT NULL,
  blocked_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (blocker_id, blocked_id),
  KEY idx_blocks_reverse (blocked_id, blocker_id),
  CONSTRAINT chk_blocks_self CHECK (blocker_id <> blocked_id),
  CONSTRAINT fk_blocks_blocker FOREIGN KEY (blocker_id) REFERENCES users (id),
  CONSTRAINT fk_blocks_blocked FOREIGN KEY (blocked_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NOT NULL,
  reported_id BIGINT UNSIGNED NOT NULL,
  reason ENUM('fake_profile','inappropriate_photo','harassment','money_request_or_scam','appears_underage','married_or_misleading','other') NOT NULL,
  details VARCHAR(1000) NULL,
  status ENUM('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
  resolution_note VARCHAR(500) NULL,
  open_key VARCHAR(41) GENERATED ALWAYS AS (IF(status = 'open', CONCAT(reporter_id, ':', reported_id), NULL)) STORED,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  resolved_at DATETIME(3) NULL,
  UNIQUE KEY uq_reports_open (open_key),
  KEY idx_reports_status (status, created_at),
  KEY idx_reports_reported (reported_id),
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users (id),
  CONSTRAINT fk_reports_reported FOREIGN KEY (reported_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE moderation_actions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_label VARCHAR(80) NOT NULL,
  actor_user_id BIGINT UNSIGNED NULL,
  target_user_id BIGINT UNSIGNED NOT NULL,
  report_id BIGINT UNSIGNED NULL,
  action ENUM('suspend','unsuspend','remove_photo','resolve_report','dismiss_report','correct_profile') NOT NULL,
  reason VARCHAR(500) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_mod_target (target_user_id),
  KEY idx_mod_created (created_at),
  CONSTRAINT fk_mod_actor FOREIGN KEY (actor_user_id) REFERENCES users (id),
  CONSTRAINT fk_mod_target FOREIGN KEY (target_user_id) REFERENCES users (id),
  CONSTRAINT fk_mod_report FOREIGN KEY (report_id) REFERENCES reports (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contact_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(254) NOT NULL,
  mobile_e164 VARCHAR(16) NULL,
  subject ENUM('general','account_help','safety','feedback','other') NOT NULL,
  message VARCHAR(2000) NOT NULL,
  locale ENUM('bn','en') NOT NULL,
  status ENUM('new','handled') NOT NULL DEFAULT 'new',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY idx_contact_created (created_at),
  CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rate_limits (
  key_hash CHAR(64) NOT NULL,
  window_start DATETIME NOT NULL,
  count INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (key_hash, window_start),
  KEY idx_rl_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Outgoing email queue (added during M3; see docs/06 §12). Rows are deleted after successful delivery.
CREATE TABLE mail_outbox (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(254) NOT NULL,
  template VARCHAR(40) NOT NULL,
  locale ENUM('bn','en') NOT NULL DEFAULT 'bn',
  payload_json JSON NOT NULL,
  status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  last_error VARCHAR(300) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  sent_at DATETIME(3) NULL,
  KEY idx_outbox_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
