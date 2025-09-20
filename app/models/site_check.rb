class SiteCheck < ApplicationRecord
  belongs_to :site

  validates :available, inclusion: { in: [ true, false ] }
end
