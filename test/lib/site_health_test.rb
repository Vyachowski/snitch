require "test_helper"
require "./lib/site_health"

class SiteHealthTest < ActiveSupport::TestCase
  setup do
    @input = "google.com"
    @http_input = "http://google.com"
    @https_input = "https://google.com"
    @invalid_input = "notasite"

    @valid_url = URI.parse "https://google.com"
  end

  test "valid url parsing" do
    assert SiteHealth.parse_url(@input).is_a?(URI::Generic)
    assert SiteHealth.parse_url(@http_input).is_a?(URI::HTTP)
    assert SiteHealth.parse_url(@https_input).is_a?(URI::HTTPS)

    assert SiteHealth.parse_url(@invalid_input).nil?
  end

  test ""
end
