
export interface UserLogin {
    username: string;
    password: string;
    remember_me?: boolean;
}


export interface User {
    id: number;
    username: string;
    name?: string;
    roles: Array<string>;
    avatar_url?: string;
    email: string;
    registered_date?: string;
}

export interface BoardList {
    id?: number;
    board_id: number;
    title: string;
    position: number;
    cards: Card[];
}

export interface Board {
    id: number;
    owner_id: number;
    title: string;
    lists: BoardList[];
    background_image?: string;
    background_color?: string;
}

export interface Card {
    id?: number;
    list_id: number;
    owner_id?: number;
    title?: string;
    description?: string;
    due_date?: string;
    position?: number;
    activities?: CardActivity[];
}

/*
    id = fields.Integer(dump_only=True)
    card_id = fields.Integer()
    user_id = fields.Integer()
    activity_on = fields.DateTime()
    entity_id = fields.Integer()
    event = fields.Integer(dump_only=True)

    comment = fields.Nested(CardCommentSchema, dump_only=True)
    member = fields.Nested(CardMemberSchema, dump_only=True)

    user = fields.Nested(
        UserSchema(only=("name", "email", "avatar_url",)),
        dump_only=True
    )

*/

export interface UserBasicInfo {
    id: number;
    name: string;
    avatar_url?: string;
}

export interface CardActivity {
    id: number;
    card_id: number;
    user_id: number;
    activity_on: string;
    entity_id?: number;
    event?: number;
    comment?: CardComment;
    user?: UserBasicInfo;
}

export interface CardComment {
    id?: number;
    user_id?: number;
    card_id: number;
    comment: string | undefined;
    created?: string;
    updated?: string;
}

export interface RegisterPayload {
    email: string,
    username: string,
    password: string,
    name?: string,
    timezone: string,
}