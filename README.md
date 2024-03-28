# GHG_emission_rationalization
GHG排出合理化

### 品目分類マスタ
品目分類コード	品目分類名	構成分割
moldprod	樹脂成型品	TRUE
almpouch	アルミ層ありの袋・フィルム	TRUE
noapouch	アルミ層なしの袋・フィルム	FALSE
lablprod	ラベル・POPシール	FALSE
paprprod	紙製資材	FALSE
paperpla	プラを含む紙製資材	TRUE
canstube	缶・チューブ	FALSE
lamitube	プラを含むラミチューブ	TRUE
vesselpr	容器	FALSE
rubberpr	ゴム製資材	FALSE
fabricpr	布・繊維	FALSE
vesselpr	容器	FALSE
othermon	その他単一構成資材	FALSE
othercom	その他複合構成資材	TRUE

### 素材マスタ
素材コード	素材名	品目分類コード	品目分類名
noapouch	軟質樹脂（パウチ）	noapouch	アルミ層なしの袋・フィルム
shrifilm	軟質樹脂（シュリンクフィルム）	noapouch	アルミ層なしの袋・フィルム
cleacase	軟質樹脂（クリアケース）	noapouch	アルミ層なしの袋・フィルム
labpaper	ラベル用紙	lablprod	ラベル
labplast	ラベル用プラ	lablprod	ラベル
paperbox	白ボール（個箱）	paprprod	紙製資材
papmount	白ボール（台紙）	paprprod	紙製資材
letter	さらし包装紙（能書）	paprprod	紙製資材
cardbord	段ボール	paprprod	紙製資材
alumcans	圧延アルミ（アルミ缶、キャップ用）	canstube	缶・チューブ
tincan	錫めっき鋼板（ブリキ缶、キャップ）	canstube	缶・チューブ
plastube	プラ製中空成形容器（プラチューブ）	canstube	缶・チューブ
alumtube	アルミニウム箔・板材（アルミチューブ）	canstube	缶・チューブ
glasbott	ガラス	vesselpr	容器・瓶
pottery	陶器	vesselpr	容器・瓶
nonwovfa	フェルト・不織布	fabricpr	布・繊維
thread	ナイロン長繊維糸・短繊維	fabricpr	布・繊維
rubber	軟質プラスチック発泡製品（緩衝材、パッキン）	rubberpr	ゴム製資材
silicone	シリコン	rubberpr	ゴム製資材
glue	接着剤（セルロース系、樹脂系）	othermon	その他単一構成資材
polyethe	PE	monomate	モノマテリアル
higdenpe	HDPE	monomate	モノマテリアル
lowdenpe	LDPE	monomate	モノマテリアル
acrystyr	AS	monomate	モノマテリアル
polysthy	PS	monomate	モノマテリアル
resistps	耐衝撃PS	monomate	モノマテリアル
acrbotst	ABS	monomate	モノマテリアル
polyprop	PP	monomate	モノマテリアル
polethte	PET	monomate	モノマテリアル
polyathe	POM	monomate	モノマテリアル
pen	PEN	monomate	モノマテリアル
elastomer	エラストマー	monomate	モノマテリアル
glassfiber	ガラス繊維	monomate	モノマテリアル
aluminiu	アルミニウム	monomate	モノマテリアル

### 成型方法マスタ
成型方法コード	成型方法名
injeblow	インジェクションブロー
onestinj	1ステージインジェクションブロー
twostinj	2ステージインジェクションブロー
direblow	ダイレクトブロー
dicolmol	2色成型
sheetmol	シート成型

### 原資材テーブル
品目コード	品名	取引先名	カテゴリー名	担当部署名	担当者メールアドレス	担当者名	構成コード
10000001	店販ブルーベリーEX60T アルミ	タイカワ商事	食品・通販技術開発G	製造本部 開発･調達統括部 製造技術開発部 ｴｺ戦略推進G			alpouchm
10000002	店販ブルーベリーEX60T アルミ 無添加削除	タイカワ商事	食品・通販技術開発G	製造本部 開発･調達統括部 製造技術開発部 ｴｺ戦略推進G			
10000003	ビタミンC180日分　アルミ袋	タイカワ商事	食品・通販技術開発G	製造本部 開発･調達統括部 製造技術開発部 ｴｺ戦略推進G			
10000011	*BLｵｸﾀﾞｹｾﾝｼﾞﾖｳﾋﾖｳﾊｸｶｴ2P ﾌｲﾙﾑ(ｼﾕﾘﾝｸﾌｲﾙﾑ)	フジシ－ル	グローバル洗浄剤	製造本部 開発･調達統括部 日用品技術開発部 ｸﾞﾛｰﾊﾞﾙ洗浄剤技術開発G			shrkfilm

### 情報テーブル
構成コード	構成名	使いまわし	在庫単位	単位重量	品目分類コード	容リ法対象	プラスチック	成型方法
alpouchm	タイカワアルミ袋　中サイズ	TRUE	m	10	almpouch	TRUE	TRUE	injeblow
alpouchl	タイカワアルミ袋　大サイズ	TRUE	m	20		TRUE	TRUE	
shrkfilm	フジシールシュリンクフィルム　Mサイズ	TRUE				TRUE	TRUE	
shrkfill	フジシールシュリンクフィルムLサイズ	TRUE				TRUE	TRUE	

### 構成テーブル
構成コード	素材コード	素材名	使用量	使用量単位
alpouchm	aluminiu	アルミニウム	10	μg
alpouchm	polyethy	PE	11	μg
alpouchl	aluminiu	アルミニウム	20	μg
alpouchl	polyethy	PE	22	μg
shrkfilm	polyethy	PE	10	μg
shrkfilm	polethte	PET	15	μg
shrkfill	polyethy	PE	12	μg
shrkfill	polethte	PET	22	μg
