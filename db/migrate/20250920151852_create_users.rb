class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :browser_id
      t.string :browser_storage_id
      t.string :email
      t.string :password_digest

      t.timestamps
    end
  end
end
