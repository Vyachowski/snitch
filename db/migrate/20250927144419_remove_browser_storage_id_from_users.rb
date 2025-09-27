class RemoveBrowserStorageIdFromUsers < ActiveRecord::Migration[8.0]
  def change
    remove_column :users, :browser_storage_id, :string
  end
end
