require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "should get index" do
    get users_url, as: :json
    assert_response :success
  end

  test "should create user" do
    assert_difference("User.count") do
      assert_difference("User.count") do
        post users_url, params: { user: {
          browser_id: "unique_browser_id_#{SecureRandom.hex(4)}",
          browser_storage_id: "unique_storage_id_#{SecureRandom.hex(4)}",
          email: "user#{SecureRandom.hex(4)}@example.com",
          password_digest: "password123"
        } }, as: :json
      end
    end

    assert_response :created
  end

  test "should show user" do
    get user_url(@user), as: :json
    assert_response :success
  end

  test "should update user" do
    patch user_url(@user), params: { user: { browser_id: @user.browser_id, browser_storage_id: @user.browser_storage_id, email: @user.email, password_digest: @user.password_digest } }, as: :json
    assert_response :success
  end

  test "should destroy user" do
    assert_difference("User.count", -1) do
      delete user_url(@user), as: :json
    end

    assert_response :no_content
  end
end
