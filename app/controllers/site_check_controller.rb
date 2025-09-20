class SiteCheckController < ApplicationController
  before_action :set_site, only: %i[ show update destroy ]
  before_action :set_site_check, only: %i[ show update destroy ]

  def index
    @sites = SiteCheck.all

    render json: @site_checks
  end

  def show
    render json: @site_check
  end

  def create
    @site_check = SiteCheck.new(site_params)

    if @site_check.save
      render json: @site_check, status: :created, location: @site_check
    else
      render json: @site_check.errors, status: :unprocessable_entity
    end
  end

  def update
    if @site_check.update(site_params)
      render json: @site_check
    else
      render json: @site_check.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @site_check.destroy!
  end

  private
    def set_site
      @site = Site.find(params.expect(:site_id))
    end

    def set_site_check
      @user = SiteCheck.find(params.expect(:site_check_id))
    end

    def site_params
      params.expect(site: [ :url ], site_check: [ :user_id ])
    end
end
