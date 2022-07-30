class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, 
         :registerable,
         :recoverable,
         :validatable, 
         :confirmable, 
         :trackable,
         :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

	validates :name, presence: true
  validates :email, presence: true, uniqueness: true

  def jwt_payload
    { 'expiry_date' => 'todo' }
  end
end