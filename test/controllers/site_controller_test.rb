require "test_helper"

class SiteControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @site = sites(:one)
  end

  test "should get index" do
    get sites_url, as: :json
    assert_response :success
  end

  # test "should create site" do
  #   assert_difference("Site.count") do
  #     post sites_url, params: { site: {
  #       url: "https://sitechecker.com",
  #       user: @user
  #     } }, as: :json
  #   end

  #   assert_response :created
  # end

  test "should show site" do
    get site_url(@user), as: :json
    assert_response :success
  end

  # test "should update user" do
  #   patch user_url(@user), params: { user: { browser_id: @user.browser_id, browser_storage_id: @user.browser_storage_id, email: @user.email, password_digest: @user.password_digest } }, as: :json
  #   assert_response :success
  # end

  # test "should destroy user" do
  #   assert_difference("User.count", -1) do
  #     delete user_url(@user), as: :json
  #   end

  #   assert_response :no_content
  # end
end
