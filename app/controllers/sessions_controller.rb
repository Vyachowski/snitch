class SessionsController < ApplicationController
  def create
    if user = User.authenticate_by(browser_id: params[:browser_id])
      session[:current_user_id] = user.id

      render json: { message: "Logged in" }, status: :ok
    else
      render json: { error: "Invalid browser_id" }, status: :unauthorized
    end
  end

  def destroy
    session.delete(:current_user_id)

    @current_user = nil

    render json: { message: "Logged out" }, status: :ok
  end
end
