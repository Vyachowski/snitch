class User < ApplicationRecord
  validates :browser_id, presence: true, uniqueness: true
  validates :browser_storage_id, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }
end
