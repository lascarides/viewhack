DNZ_API_KEY = 'iaStyqKuqiBjgS7J6Td5'

require 'rubygems'
require "bundler/setup"
require 'sinatra'
require 'haml'
require 'nokogiri'
require 'json'
require 'net/http'
require 'open-uri'

get '/' do
	haml :index
end

