class User < ApplicationRecord
  has_many :sites, dependent: :destroy

  validates :browser_id, presence: true, uniqueness: true
  validates :browser_storage_id, presence: true, uniqueness: true
  validates :email, uniqueness: true, allow_nil: true, format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }
end
