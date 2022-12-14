module Types
  class QueryType < Types::BaseObject
    include GraphQL::Types::Relay::HasNodeField
    include GraphQL::Types::Relay::HasNodesField


    field :description, String, null: false, description: "Transparent politics description"
    field :current_user, UserType, null: true, description: "Get currently signed in user" do
      argument :local_id, String, required: true
      argument :local_token, String, required: true
    end
    field :my_communities, [CommunityType], null: true, description: "Get current user's community" do
      argument :user_id, String, required: true
    end


    def description
      "Transparent Politics is live"
    end

    def current_user(local_id: nil, local_token: nil)
      if context[:current_user]
        user = context[:current_user]
        return user
      else
        decoded_token = JWT.decode(local_token, nil, false)
        exp = decoded_token[0]["exp"]
        return nil unless Time.now.to_i < exp
        user_id = decoded_token[0]["sub"]
        return unless user_id == local_id
        user = User.find_by_id(local_id)
      end

      return nil unless user
      return { 
        id: user.id,
        email: user.email,
        name: user.name,
        token: local_token,
        address: nil,
        description: nil,
        profile_picture: nil,
        phone_number: nil,
        social_media_links: nil,
      }
    end

    def my_communities(user_id: nil)
      user = context[:current_user]
      return nil unless user
      return nil unless user.id == user_id.to_i
      return nil unless user.communities.any?

      user.communities
    end
  end
end
