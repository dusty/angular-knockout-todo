class Task
  include Mongoid::Document
  include Mongoid::Timestamps

  field :complete, :type => Boolean, :default => false
  field :description, :type => String

  validates_presence_of :description

end
