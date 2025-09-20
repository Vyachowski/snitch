class CreateSiteChecks < ActiveRecord::Migration[8.0]
  def change
    create_table :site_checks do |t|
      t.boolean :available, null: false
      t.references :site, null: false, foreign_key: true

      t.timestamps
    end
  end
end
