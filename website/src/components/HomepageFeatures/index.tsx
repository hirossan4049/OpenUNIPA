import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '簡単セットアップ',
    description: (
      <>
        わずか数行のコードでUNIPAシステムにアクセス可能。
        TypeScriptで書かれており、型安全性も確保されています。
      </>
    ),
  },
  {
    title: '豊富な機能',
    description: (
      <>
        時間割・成績・出席状況・掲示情報の取得から、
        統計分析やフィルタリングまで幅広い機能を提供。
      </>
    ),
  },
  {
    title: 'テスト対応',
    description: (
      <>
        スタブモードでテストデータを使用可能。
        実際のAPIを呼ばずに開発・テストができます。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {Svg && (
          <Svg className={styles.featureSvg} role="img" />
        )}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}