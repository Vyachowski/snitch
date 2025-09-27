class ApplicationController < ActionController::API
  helper_method :current_user

  private

  def current_user
    @current_user ||= User.find_by(id: session[:current_user_id]) if session[:current_user_id]
  end
end
