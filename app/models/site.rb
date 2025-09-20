class Site < ApplicationRecord
  belongs_to :user

  validates :url, format: { with: URI::DEFAULT_PARSER.make_regexp(%w[http https]), message: "must be a valid url address" }
end
