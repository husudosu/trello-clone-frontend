import moment from "moment-timezone";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface IPaginatedLinks {
    first: string;
    last: string;
}

export interface IPaginatedResponse {
    links: IPaginatedLinks;
    page: number;
    pages: number;
    per_page: number;
    total: number;
}

export interface IPaginatedQuery {
    page?: number;
    per_page?: number;
    sort_by?: number;
    order?: "asc" | "desc";
}

export interface IUserLogin {
    username: string;
    password: string;
    remember_me?: boolean;
}

export interface IUser {
    id: Readonly<number>;
    username: string;
    name?: string;
    roles: Array<string>;
    avatar_url?: string;
    email: string;
    registered_date?: string;
    timezone: string;
}

export interface IUserUpdate extends Omit<IUser, "roles"> {
    password?: string; // New password
    current_password: string | null;
}


export interface IDraftBoardList {
    board_id: number;
    title: string;
    archived: boolean;
}

export interface IBoardList {
    id: Readonly<number>;
    board_id: number;
    title: string;
    position: number;
    cards: ICard[];
    archived: boolean;
}

export interface IBoard {
    id: Readonly<number>;
    owner_id: number;
    title: string;
    lists: IBoardList[];
    background_image?: string;
    background_color?: string;
    archived: boolean;
    archived_on: string;
}


export interface IBoardRolePermission {
    id: Readonly<number>;
    name: string;
    allow: boolean;
}

export interface IBoardRole {
    id: Readonly<number>;
    name: string;
    is_admin: boolean;
    permissions: IBoardRolePermission[];
}

export interface IBoardClaims {
    id: Readonly<number>;
    board_id: number;
    is_owner: boolean;
    user_id: number;
    role: IBoardRole;
}


export interface IDraftCard {
    title: string;
    list_id: number;
}

export interface ICard {
    id: Readonly<number>;
    list_id: number;
    title: string;
    description?: string;
    position: number;
    checklists: ICardChecklist[];
    assigned_members: ICardMember[];
    dates: ICardDate[];
    archived_on: Readonly<moment.Moment>;
    archived: Readonly<boolean>;
    archived_by_list: Readonly<boolean>;
}


export interface IDraftCardDate {
    dt_from?: string;
    dt_to: string | null;
    description?: string;
    complete: boolean;
}

export interface ICardDate {
    id: Readonly<number>;
    card_id: Readonly<number>;
    dt_from?: moment.Moment | null;
    dt_to: moment.Moment;
    description?: string;
    complete: boolean;
}

export interface IDraftCardMember {
    board_user_id: number;
    send_notification: boolean;
}

export interface ICardMember {
    id: Readonly<number>;
    board_user: IBoardMemberInfo;
    board_user_id: number;
    send_notification: boolean;
}

export interface IUserBasicInfo {
    id: Readonly<number>;
    name: string;
    avatar_url?: string;
    username: string;
    timezone: string;
}

export interface IBoardMemberInfo {
    id: Readonly<number>;
    user: IUserBasicInfo;
    is_deleted: boolean;
}

export interface ICardListChange {
    id: Readonly<number>;
    activity_id: number;
    from_list_id: number;
    to_list_id: number;
    from_list: Partial<IBoardList>;
    to_list: Partial<IBoardList>;
}

export interface ICardActivity {
    id: Readonly<number>;
    card_id: number;
    board_id: number;
    board_user_id: number;
    activity_on: moment.Moment;
    entity_id?: number;
    event?: CardActivityEvent | BoardActivityEvent;
    comment?: ICardComment;
    list_change?: ICardListChange;
    board_user: IBoardMemberInfo;
    changes: string;
}

export interface IPaginatedCardActivity extends IPaginatedResponse {
    data: ICardActivity[];
}

export type CardActivityQueryType = "all" | "comment";

export interface ICardActivityQueryParams extends IPaginatedQuery {
    type?: CardActivityQueryType;
    dt_from?: string;
    dt_to?: string;
}

export interface ICardComment {
    id?: Readonly<number>;
    user_id?: number;
    card_id: number;
    comment: string | undefined;
    created?: moment.Moment;
    updated?: moment.Moment;
}

export interface IRegisterPayload {
    email: string,
    username: string,
    password: string,
    name?: string,
    timezone: string,
}

export interface IBoardAllowedUser {
    id: Readonly<number>;
    user_id: number;
    board_id: number;
    board_role_id: number;
    is_owner: boolean;
    is_deleted: boolean;
    role: IBoardRole;
    user: IUserBasicInfo;
}

export interface IAddBoardMemberType {
    board_role_id: number;
    user_id: number;
}

export interface IRemoveBoardMemberType {
    user_id: number;
}


export interface IChecklistItem {
    id: Readonly<number>;
    checklist_id: Readonly<number>;
    marked_complete_board_user_id?: number;
    assigned_user_id?: number;

    title: string;
    due_date?: moment.Moment;
    completed: boolean;
    marked_complete_on?: moment.Moment;
    marked_complete_user?: IBoardMemberInfo;
    assigned_user?: IBoardMemberInfo;
    position?: number;
}


export type IDraftChecklistItem = Optional<IChecklistItem, "id" | "checklist_id" | "completed">;

export interface ICardChecklist {
    id: Readonly<number>;
    card_id: Readonly<number>;
    title?: string;
    items: IChecklistItem[];
}

export interface IArchivedCard {
    archived_on: moment.Moment;
    board_list: Pick<IBoardList, "title" | "id" | "archived">;
    archived: boolean;
    id: number;
    title: string;
}

export interface IArchivedList {
    archived_on: moment.Moment;
    id: number;
    title: string;
    cards: Array<Pick<ICard, "id" | "title">>;
}

export enum BoardActivityEvent {
    BOARD_CREATE = "board.create",
    BOARD_ARCHIVE = "board.archive",
    BOARD_CHANGE_TITLE = "board.change_title",
    BOARD_CHANGE_OWNER = "board.change-owner",
    BOARD_REVERT = "board.revert",

    MEMBER_ADD = "member.add",
    MEMBER_ACCESS_REVOKE = "member.access_revoke",
    MEMBER_DELETE = "member.delete",
    MEMBER_REVERT = "member.revert",
    MEMBER_CHANGE_ROLE = "member.change_role",

    LIST_CREATE = "list.create",
    LIST_UPDATE = "list.update",
    LIST_ARCHIVE = "list.archive",
    LIST_REVERT = "list.revert",
    LIST_DELETE = "list.delete",

    CARD_DELETE = "card.delete"

}

export enum CardActivityEvent {
    CARD_ASSIGN_TO_LIST = "card.create",
    CARD_MOVE_TO_LIST = "card.move",
    CARD_COMMENT = "card.comment",
    CARD_ARCHIVE = "card.archive",
    CARD_REVERT = "card.revert",
    CHECKLIST_CREATE = "checklist.create",
    CHECKLIST_UPDATE = "checklist.update",
    CHECKLIST_DELETE = "checklist.delete",
    CHECKLIST_ITEM_MARKED = "checklist.item.marked",
    CHECKLIST_ITEM_DUE_DATE = "checklist.item.due_date",
    CHECKLIST_ITEM_USER_ASSIGN = "checklist.item.user_assign",
    CARD_ASSIGN_MEMBER = "card.member.assign",
    CARD_DEASSIGN_MEMBER = "card.member.deassign",
    CARD_ADD_DATE = "card.date.create",
    CARD_EDIT_DATE = "card.date.update",
    CARD_DELETE_DATE = "card.date.delete",
}


export enum BoardPermission {
    CARD_EDIT = "card.edit",
    CARD_COMMENT = "card.comment",
    CARD_DELETE = "card.delete",
    CARD_ASSIGN_MEMBER = "card.assign_member",
    CARD_DEASSIGN_MEMBER = "card.deassign_member",
    CARD_ADD_DATE = "card.add_date",
    CARD_EDIT_DATE = "card.edit_date",
    LIST_CREATE = "list.create",
    LIST_EDIT = "list.edit",
    LIST_DELETE = "list.delete",
    BOARD_UPDATE = "board.update",
    CHECKLIST_CREATE = "checklist.create",
    CHECKLIST_EDIT = "checklist.edit",
    CHECKLIST_ITEM_MARK = "checklist_item.mark",
}