class SitesController < ApplicationController
  before_action :set_site, only: %i[ show update destroy ]
  before_action :set_user, only: %i[ create ]

  def index
    @sites = Site.all

    render json: @sites
  end

  def show
    render json: @site
  end

  def create
    @site = current_user.sites.new(site_params)

    if @site.save
      render json: @site, status: :created, location: @site
    else
      render json: @site.errors, status: :unprocessable_entity
    end
  end

  def update
    if @site.update(site_params)
      render json: @site
    else
      render json: @site.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @site.destroy!
  end

  private
    def set_site
      @site = Site.find(params.expect(:id))
    end

    def set_user
      @user = User.find(params.expect(:user_id))
    end

    def site_params
      params.expect(:id)
    end
end
