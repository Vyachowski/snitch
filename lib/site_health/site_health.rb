require "uri"
require "net/http"

module SiteHealth
  PROTOCOL_REGEX = /^(http|https):\/\//
  URL_REGEX = URI::DEFAULT_PARSER.make_regexp(%w[http https])
  DEFAULT_PROTOCOL = "http://"

  def self.parse_url(input)
    begin
      url_string = input.match(PROTOCOL_REGEX) ? input : "#{DEFAULT_PROTOCOL}#{input}"
      return nil unless url_string.match(URL_REGEX)

      uri = URI.parse(url_string)
      uri.is_a?(URI::HTTP) && uri.host.present? && uri.host.include?(".") ? uri : nil
    rescue URI::BadURIError
      nil
    end
  end

  def self.try_https_protocol(uri)
    return uri if uri.scheme == "https"

    https_uri = uri.dup
    https_uri.scheme = "https"
    https_port = https_uri.port == 80 ? 443 : https_uri.port

    begin
      http = Net::HTTP.new(https_uri.host, https_port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER

      response = http.get(https_uri.request_uri)
      response.is_a?(Net::HTTPResponse) ? https_uri : uri
    rescue
      uri
    end
  end

  def self.server_responds?(uri)
    begin
      response = Net::HTTP.get_response(uri)

      true if response.is_a?(Net::HTTPResponse)
    rescue StandardError
      false
    end
  end
end
