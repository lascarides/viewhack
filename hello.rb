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

get '/video' do
	haml :video
end

get '/audio' do
	haml :audio
end

get '/image' do
	haml :image
end

get '/ebook' do
	haml :ebook
end

get '/multipage' do
	haml :multipage
end

get '/complex' do 
	haml :complex
end
